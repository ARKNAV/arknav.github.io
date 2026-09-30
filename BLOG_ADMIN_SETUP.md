# Activate the on-site blog editor

The `/admin/` editor is published at `https://arknav.github.io/admin/`. The login Worker is deployed at `https://arknav-blog-auth.arknav.workers.dev` and the editor is configured to use it. GitHub OAuth credentials are still required to activate login.

The public website stays on GitHub Pages. A separate Cloudflare Worker handles the GitHub OAuth exchange. It allows only `ARKNAV`, checks write access to `ARKNAV/arknav.github.io`, and uses state cookies and PKCE to verify login. The client secret stays in Worker secrets. The editor saves Markdown and images directly to `main`, which triggers the existing Pages workflow.

## 1. Publish the login Worker

Use your own Cloudflare account. From the project directory:

```sh
npx wrangler login
npx wrangler deploy --config services/blog-auth/wrangler.jsonc
```

Record the HTTPS origin printed by Wrangler, for example `https://arknav-blog-auth.YOUR-SUBDOMAIN.workers.dev`. The Worker initially refuses login because its OAuth secrets are not configured.

This step is already complete for this website. The deployed origin is `https://arknav-blog-auth.arknav.workers.dev`.

## 2. Register a GitHub OAuth app

In GitHub, open **Settings → Developer settings → OAuth Apps → New OAuth App** while signed in as `ARKNAV`.

- Application name: `Arnav blog editor`
- Homepage URL: `https://arknav.github.io`
- Authorization callback URL: `https://arknav-blog-auth.arknav.workers.dev/callback`
- Leave wildcard callback matching and device flow disabled.

Generate a client secret. Add the app's Client ID and client secret using Wrangler's interactive prompts:

For the current assisted setup, you can instead fill in the two blank values in the ignored local `.env.blog-auth` file. Tell the assistant when you have saved it; the assistant can upload those values without displaying them. Do not paste the secret into chat. This file is not part of the public repository.

```sh
npx wrangler secret put GITHUB_CLIENT_ID --config services/blog-auth/wrangler.jsonc
npx wrangler secret put GITHUB_CLIENT_SECRET --config services/blog-auth/wrangler.jsonc
```

To upload the private local file's values yourself, use `npx wrangler secret bulk .env.blog-auth --config services/blog-auth/wrangler.jsonc` after filling in both values.

Do not put the client secret in the website, a Markdown file, or Git. The Worker requests `public_repo`, which grants OAuth access to public repositories; GitHub does not scope this OAuth permission to one public repository. Review the permission screen when authorizing. This login service restricts its editor handoff to your account and checks the configured repository.

## 3. Connect the editor and publish the website

In `public/admin/settings.json`, set the Worker origin (no path):

```json
{
  "authBaseUrl": "https://arknav-blog-auth.arknav.workers.dev"
}
```

Keep `SITE_ORIGIN` in `services/blog-auth/wrangler.jsonc` aligned with the website's exact origin. If you later add a custom domain, update it and the URLs in `public/admin/config.yml`, then redeploy the Worker. The login handoff deliberately rejects other origins, including localhost.

Commit and push the website changes to `main` when ready. The included GitHub Pages workflow publishes `/admin/`. These instructions do not require moving the website to another hosting service.

The initial website publication is already complete. You only need to configure the OAuth credentials to activate login; no new website build is required for Worker secret changes.

## Write and publish

1. Visit `https://arknav.github.io/admin/`, or click **Write a post** on the blog.
2. Click **Login with GitHub** and authorize your OAuth app as `ARKNAV`.
3. Open **Blog posts → New Blog post**. Fill in the title, date, excerpt, category, tags, and body. Use the Markdown editor's image control to upload images.
4. Keep **Draft** enabled and click the editor's save/publish control to save work in GitHub without including it on the public blog. This draft is still readable in the public GitHub repository.
5. Disable **Draft** and save when ready to publish. The editor commits to `main`; wait for **Actions → Deploy to GitHub Pages** to finish, then check the blog.

Existing posts can be edited in the collection or with **Edit this post** on an article. The `_TEMPLATE.md` entry may appear in the editor; leave it alone and create a new entry for your writing. Renaming a title does not automatically rename the existing post's URL. Dates do not schedule publication.

The editor uses Decap CMS 3.16.3 with a pinned script and integrity check. It uses Decap's standard editor appearance. The public blog keeps its existing design. A native Markdown preview is available inside the editor; a full replica of the article layout is not configured.

## Verification and troubleshooting

- Local checks: `node --test services/blog-auth/worker.test.mjs` and `npm run build`.
- For a local editor preview, run `npm run dev` and visit `/admin/index.html`. Vinext's development server serves this static entrypoint directly; GitHub Pages serves it at `/admin/`. Production GitHub sign-in deliberately rejects the localhost origin.
- Worker package check: `npx wrangler deploy --dry-run --config services/blog-auth/wrangler.jsonc`.
- An editor setup message means `authBaseUrl` is still empty or invalid.
- A GitHub redirect error usually means the OAuth app's callback URL does not exactly match the Worker URL plus `/callback`.
- A rejected login means the account is not `ARKNAV`, repository write access is missing, or the state cookie expired. Retry login in the same browser.
- An article saved as a draft is intentionally excluded from the blog. A failed Pages workflow must be fixed before any new save becomes public.
- Branch protection can prevent direct saves to `main`. This setup assumes the current direct publishing workflow; an approval workflow would need a separate editorial-workflow configuration.

End-to-end login and publishing require the real OAuth app, deployed Worker, and live website. They have not been verified locally.

## Official references

- [Decap GitHub backend](https://decapcms.org/docs/github-backend/)
- [Decap configuration](https://decapcms.org/docs/configuration-options/)
- [Decap external OAuth clients](https://decapcms.org/docs/external-oauth-clients/)
- [GitHub OAuth authorization](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps)
- [Cloudflare Worker secrets](https://developers.cloudflare.com/workers/configuration/secrets/)
