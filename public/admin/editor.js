/* GitHub OAuth secrets live only in the separate login Worker. */
window.CMS_MANUAL_INIT = true;

(async function openEditor() {
  const status = document.getElementById('editor-status');
  const message = document.getElementById('editor-message');
  try {
    const response = await fetch('settings.json', { cache: 'no-store' });
    if (!response.ok) throw new Error('Editor settings could not be loaded.');
    const { authBaseUrl } = await response.json();
    if (!authBaseUrl) {
      message.textContent = 'GitHub login has not been connected yet. Complete the setup in BLOG_ADMIN_SETUP.md to activate this editor.';
      return;
    }
    const auth = new URL(authBaseUrl);
    if (auth.protocol !== 'https:' || auth.pathname !== '/' || auth.search || auth.hash || auth.username || auth.password) {
      throw new Error('The login service must be an HTTPS origin. Check the editor settings.');
    }
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/decap-cms@3.16.3/dist/decap-cms.js';
    script.integrity = 'sha384-A/Gdn928CNLufmnGWGs9RM4Q9o8bSNLeJERqBFrBjwzL7FRpoLT3MPF8Tl0+Wd2p';
    script.crossOrigin = 'anonymous';
    await new Promise((resolve, reject) => {
      script.onload = resolve;
      script.onerror = () => reject(new Error('The editor could not load. Please refresh and try again.'));
      document.head.appendChild(script);
    });
    window.CMS.init({ config: { backend: { base_url: auth.origin, auth_endpoint: 'auth' } } });
    status.hidden = true;
  } catch (error) {
    message.textContent = error instanceof Error ? error.message : 'The editor could not open.';
  }
})();
