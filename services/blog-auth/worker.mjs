const cookieName = '__Host-blog_oauth_state';
const securityHeaders = {
  'Cache-Control': 'no-store',
  'Referrer-Policy': 'no-referrer',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
};
const clearCookie = `${cookieName}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;

function response(body, status = 200, headers = {}) {
  return new Response(body, { status, headers: { ...securityHeaders, ...headers } });
}

function base64url(bytes) {
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// Decap's popup protocol: handshake, then send the token to the fixed site origin.
// Never accept an origin or redirect destination supplied by the browser.
function popup(origin, result, success) {
  const nonce = crypto.randomUUID();
  const data = JSON.stringify(`authorization:github:${success ? 'success' : 'error'}:${JSON.stringify(result)}`).replace(/</g, '\\u003c');
  const target = JSON.stringify(origin);
  return response(`<!doctype html><html lang="en"><meta charset="utf-8"><title>GitHub sign-in</title>
<p>Returning to the blog editor. You can close this window after sign-in.</p>
<script nonce="${nonce}">
const target = ${target};
window.addEventListener('message', function finish(event) {
  if (event.origin !== target || event.source !== window.opener || event.data !== 'authorizing:github') return;
  window.removeEventListener('message', finish);
  window.opener.postMessage(${data}, target);
});
if (window.opener) window.opener.postMessage('authorizing:github', target);
</script></html>`, success ? 200 : 403, {
    'Content-Type': 'text/html; charset=utf-8',
    'Set-Cookie': clearCookie,
    'Content-Security-Policy': `default-src 'none'; script-src 'nonce-${nonce}'; base-uri 'none'; frame-ancestors 'none'`,
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method !== 'GET') return response('Method not allowed.', 405, { Allow: 'GET' });
    if (!['/auth', '/callback'].includes(url.pathname)) return response('Not found.', 404);
    let origin;
    try {
      const site = new URL(env.SITE_ORIGIN);
      if (site.protocol !== 'https:' || site.pathname !== '/' || site.search || site.hash || site.username || site.password) throw new Error();
      origin = site.origin;
    } catch {
      return response('The login service is not configured.', 503);
    }
    if (!env.GITHUB_CLIENT_ID || !env.GITHUB_CLIENT_SECRET || !env.ALLOWED_LOGIN || !/^[\w.-]+\/[\w.-]+$/.test(env.GITHUB_REPO || '')) {
      return response('The login service is not configured.', 503);
    }
    if (url.protocol !== 'https:') return response('HTTPS is required.', 400);
    if (url.pathname === '/auth') {
      if (url.searchParams.get('provider') !== 'github') return response('Unsupported login provider.', 400);
      const state = crypto.randomUUID();
      const verifier = base64url(crypto.getRandomValues(new Uint8Array(32)));
      const challenge = base64url(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier))));
      const authorize = new URL('https://github.com/login/oauth/authorize');
      authorize.search = new URLSearchParams({
        client_id: env.GITHUB_CLIENT_ID,
        redirect_uri: `${url.origin}/callback`,
        scope: 'public_repo',
        state,
        code_challenge: challenge,
        code_challenge_method: 'S256',
      }).toString();
      return response(null, 302, {
        Location: authorize.href,
        'Set-Cookie': `${cookieName}=${state}.${verifier}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`,
      });
    }

    const state = url.searchParams.get('state');
    const cookie = (request.headers.get('Cookie') || '').split(';').map(part => part.trim()).find(part => part.startsWith(`${cookieName}=`))?.slice(cookieName.length + 1);
    const [savedState, verifier] = (cookie || '').split('.');
    if (!state || state !== savedState || !/^[A-Za-z0-9_-]{43}$/.test(verifier || '')) {
      return popup(origin, { message: 'Sign-in expired or could not be verified. Please try again.' }, false);
    }
    if (url.searchParams.has('error') || !url.searchParams.get('code')) {
      return popup(origin, { message: 'GitHub sign-in was canceled. Please try again.' }, false);
    }
    try {
      const exchange = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ client_id: env.GITHUB_CLIENT_ID, client_secret: env.GITHUB_CLIENT_SECRET, code: url.searchParams.get('code'), code_verifier: verifier, redirect_uri: `${url.origin}/callback` }),
        signal: AbortSignal.timeout(10000),
      });
      const token = await exchange.json();
      if (!exchange.ok || token.error || typeof token.access_token !== 'string' || !token.access_token) throw new Error();
      const headers = { Authorization: `Bearer ${token.access_token}`, Accept: 'application/vnd.github+json', 'User-Agent': 'arknav-blog-editor', 'X-GitHub-Api-Version': '2022-11-28' };
      const [userResponse, repoResponse] = await Promise.all([
        fetch('https://api.github.com/user', { headers, signal: AbortSignal.timeout(10000) }),
        fetch(`https://api.github.com/repos/${env.GITHUB_REPO}`, { headers, signal: AbortSignal.timeout(10000) }),
      ]);
      if (!userResponse.ok || !repoResponse.ok) throw new Error();
      const user = await userResponse.json();
      const repo = await repoResponse.json();
      if (String(user.login).toLowerCase() !== env.ALLOWED_LOGIN.toLowerCase() || repo.permissions?.push !== true) {
        return popup(origin, { message: 'Only the blog owner with repository write access can use this editor.' }, false);
      }
      return popup(origin, { token: token.access_token, provider: 'github' }, true);
    } catch {
      return popup(origin, { message: 'GitHub sign-in could not be completed. Please try again.' }, false);
    }
  },
};
