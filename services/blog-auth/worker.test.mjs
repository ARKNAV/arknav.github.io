import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import test from 'node:test';
import vm from 'node:vm';
import worker from './worker.mjs';

const env = {
  SITE_ORIGIN: 'https://arknav.github.io',
  GITHUB_REPO: 'ARKNAV/arknav.github.io',
  ALLOWED_LOGIN: 'ARKNAV',
  GITHUB_CLIENT_ID: 'test-client',
  GITHUB_CLIENT_SECRET: 'test-secret',
};
const origin = 'https://login.example.com';

async function begin() {
  const result = await worker.fetch(new Request(`${origin}/auth?provider=github&scope=repo`), env);
  assert.equal(result.status, 302);
  const location = new URL(result.headers.get('Location'));
  const cookie = result.headers.get('Set-Cookie').split(';')[0];
  const state = location.searchParams.get('state');
  const verifier = cookie.split('=')[1].split('.')[1];
  assert.equal(location.origin, 'https://github.com');
  assert.equal(location.searchParams.get('scope'), 'public_repo');
  assert.equal(location.searchParams.get('redirect_uri'), `${origin}/callback`);
  assert.equal(location.searchParams.get('code_challenge_method'), 'S256');
  assert.equal(location.searchParams.get('code_challenge'), createHash('sha256').update(verifier).digest('base64url'));
  assert.match(result.headers.get('Set-Cookie'), /HttpOnly; Secure; SameSite=Lax; Max-Age=600/);
  return { cookie, state, verifier };
}

function callback(session, extra = '') {
  return new Request(`${origin}/callback?state=${session.state}&code=test-code${extra}`, { headers: { Cookie: session.cookie } });
}

test('rejects unsupported routes, methods, insecure transport, and missing setup', async () => {
  assert.equal((await worker.fetch(new Request(`${origin}/missing`), env)).status, 404);
  assert.equal((await worker.fetch(new Request(`${origin}/auth`, { method: 'POST' }), env)).status, 405);
  assert.equal((await worker.fetch(new Request('http://login.example.com/auth?provider=github'), env)).status, 400);
  assert.equal((await worker.fetch(new Request(`${origin}/auth?provider=gitlab`), env)).status, 400);
  assert.equal((await worker.fetch(new Request(`${origin}/auth?provider=github`), { ...env, GITHUB_CLIENT_SECRET: '' })).status, 503);
  assert.equal((await worker.fetch(new Request(`${origin}/auth?provider=github`), { ...env, SITE_ORIGIN: 'https://site.example/path' })).status, 503);
});

test('missing or mismatched state and canceled login never exchange a token', async () => {
  const session = await begin();
  const originalFetch = globalThis.fetch;
  globalThis.fetch = () => { throw new Error('Must not contact GitHub'); };
  try {
    for (const request of [new Request(`${origin}/callback?state=x&code=test`), callback({ ...session, state: 'wrong' }), callback(session, '&error=access_denied')]) {
      const result = await worker.fetch(request, env);
      assert.equal(result.status, 403);
      assert.match(result.headers.get('Set-Cookie'), /Max-Age=0/);
      assert.match(await result.text(), /authorization:github:error:/);
    }
  } finally { globalThis.fetch = originalFetch; }
});

test('allows owner with write access and hands token only to the exact opener origin', async () => {
  const session = await begin();
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url, options) => {
    if (url.endsWith('/access_token')) {
      const body = JSON.parse(options.body);
      assert.equal(body.code_verifier, session.verifier);
      assert.equal(body.client_secret, env.GITHUB_CLIENT_SECRET);
      return Response.json({ access_token: 'test-token' });
    }
    assert.equal(options.headers.Authorization, 'Bearer test-token');
    return Response.json(url.endsWith('/user') ? { login: 'arknav' } : { permissions: { push: true } });
  };
  try {
    const result = await worker.fetch(callback(session), env);
    const html = await result.text();
    assert.equal(result.status, 200);
    assert.equal(result.headers.get('Cache-Control'), 'no-store');
    assert.match(result.headers.get('Content-Security-Policy'), /frame-ancestors 'none'/);
    assert.doesNotMatch(html, /test-secret/);
    const sent = [];
    let listener;
    const opener = { postMessage: (...args) => sent.push(args) };
    const window = { opener, addEventListener: (_, fn) => { listener = fn; }, removeEventListener: () => {} };
    vm.runInNewContext(html.match(/<script nonce="[^"]+">([\s\S]*?)<\/script>/)[1], { window });
    assert.deepEqual(sent, [['authorizing:github', env.SITE_ORIGIN]]);
    listener({ origin: 'https://attacker.example', source: opener, data: 'authorizing:github' });
    listener({ origin: env.SITE_ORIGIN, source: {}, data: 'authorizing:github' });
    assert.equal(sent.length, 1);
    listener({ origin: env.SITE_ORIGIN, source: opener, data: 'authorizing:github' });
    assert.equal(sent[1][1], env.SITE_ORIGIN);
    assert.match(sent[1][0], /authorization:github:success:/);
    assert.match(sent[1][0], /test-token/);
  } finally { globalThis.fetch = originalFetch; }
});

test('other accounts, missing repository write access, and upstream failures never receive a token', async () => {
  const originalFetch = globalThis.fetch;
  try {
    for (const scenario of ['other-user', 'read-only', 'api-failure', 'exchange-failure']) {
      const session = await begin();
      globalThis.fetch = async url => {
        if (url.endsWith('/access_token')) return Response.json(scenario === 'exchange-failure' ? { error: 'bad_code' } : { access_token: 'must-not-leak' });
        if (scenario === 'api-failure') return new Response('Unavailable', { status: 503 });
        return Response.json(url.endsWith('/user') ? { login: scenario === 'other-user' ? 'another-user' : 'ARKNAV' } : { permissions: { push: scenario !== 'read-only' } });
      };
      const result = await worker.fetch(callback(session), env);
      const html = await result.text();
      assert.equal(result.status, 403);
      assert.match(html, /authorization:github:error:/);
      assert.doesNotMatch(html, /must-not-leak|test-secret/);
    }
  } finally { globalThis.fetch = originalFetch; }
});
