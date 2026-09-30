# Blog implementation status

Updated September 29, 2026. Target repository: `ARKNAV/arknav.github.io`.

## Completed

- Separate `/blog/` listing and `/blog/<slug>/` article pages, with a Blog link in the homepage navigation.
- Shared navigation and footer; category/date/reading-time metadata, featured latest post, article cards, tags, and adjacent-post links.
- Responsive styling that extends the site's existing serif headings, navy/blue palette, and bordered surfaces. Design references: Ghost Casper and Edition (source templates reviewed; no code/assets copied).
- GitHub authoring through repository Markdown files. Commits to `main` trigger the existing Pages workflow.
- Added a separate `/admin/` Decap CMS editor, with matching Markdown fields, image uploads into `public/blog`, drafts, and direct saves to `main`. Blog author links now open this editor.
- Added a separate Cloudflare Worker for GitHub OAuth, with state verification, PKCE, secure cookies, fixed-origin popup messaging, owner restriction, and repository write-access checks. No client secret is in the static website.
- Added `BLOG_ADMIN_SETUP.md` with exact account setup and publishing instructions. The editor shows a setup message until its login service URL is configured.
- Standard Markdown and YAML parsing using `marked` and `gray-matter`; rendered HTML is sanitized with `sanitize-html`.
- Required title/date validation, draft exclusion, deterministic newest-first sorting, and automatic reading time.
- Fixed template so copied frontmatter starts at the beginning of the file.
- The two generated posts are explicitly labeled example content and are now marked `draft: true`, so they will not appear on the public blog.
- README includes the authoring steps, metadata fields, supported Markdown, and design references.
- `scripts/prepare-pages.mjs` runs automatically after `npm run build` and creates directory entrypoints while retaining Vinext's flat exports. This avoids a Vinext prerender failure with `trailingSlash: true`.

## Verification

- Production build succeeded for the current root-domain site; both articles and the listing were exported.
- TypeScript check passed.
- Exported page existence and internal link targets checked.
- Markdown headings, emphasis, tables, fenced code, unsafe links, and HTML sanitization checked.
- Empty-blog state, draft/template exclusion, quoted YAML titles, dates, sorting, and invalid-date failure checked.
- Local `/blog/` request returned HTTP 200.
- After adding the editor: production build and TypeScript checks passed; all five admin assets are included in the static export.
- Four login-service tests passed, covering configuration failures, state verification, PKCE, authorized login, fixed-origin popup messaging, denied accounts/write access, and GitHub API failures. No real credentials are used by these tests.
- Worker deployment dry-run passed. Editor configuration, setup messages, CMS initialization, pinned-script integrity, and exported author links were checked. Local `/admin/index.html` returned HTTP 200.
- Live editor browser verification reached the **Login with GitHub** button. GitHub browser access remains blocked by a saved site permission, so an actual account login and publishing save remain unverified.
- Both OAuth credentials were securely uploaded to Cloudflare Worker secrets from the ignored local file. The live `/auth?provider=github` endpoint returns HTTP 302 to GitHub, with the exact callback URL, `public_repo` scope, and S256 PKCE.

## Remaining user actions

1. Create your own writing; the example posts remain drafts.
2. Visit `https://arknav.github.io/admin/`, click **Login with GitHub**, and authorize the app as `ARKNAV`. Confirm the editor opens and save your first post. The OAuth app credentials are installed and the authorization redirect is working; actual login and publishing remain unverified.

## Deployment progress

- Registered the Cloudflare account's `arknav.workers.dev` subdomain and deployed `arknav-blog-auth` successfully.
- GitHub OAuth callback URL: `https://arknav-blog-auth.arknav.workers.dev/callback`.
- Chrome computer access was not approved; GitHub's browser-only OAuth app registration needs user interaction.
- The website source was committed as `ca4bd4373d00f25b192f4a74d184345476888b57` and pushed to `main` using the existing Git credentials. GitHub Pages run `36656305423` completed successfully.
- The blog and editor are published at `https://arknav.github.io/blog/` and `https://arknav.github.io/admin/`. The OAuth credentials are now installed, and the login service redirects to GitHub successfully.
- A private ignored `.env.blog-auth` file is available locally for the OAuth credentials. Both credentials have been uploaded to Worker secrets without displaying their values. The file remains excluded from Git.

## Known framework limitation outside the current deployment

Testing `PAGES_BASE_PATH=/test-site` exposed a Vinext static-prerender failure (404 responses for dynamic article routes). The current `arknav.github.io` root-domain build does not use a base path and succeeds. Moving to a project repository under `/repository-name` requires addressing that framework limitation first. The existing base-path configuration was preserved.

## Key files

- `app/blog/page.tsx`, `app/blog/[slug]/page.tsx`, `components/blog-shell.tsx`
- `lib/blog.ts`, `content/posts/_TEMPLATE.md`, `content/posts/*.md`
- `app/globals.css`, `app/page.tsx`, `app/layout.tsx`
- `scripts/prepare-pages.mjs`, `package.json`, `package-lock.json`, `README.md`
- `public/admin/`, `services/blog-auth/`, `BLOG_ADMIN_SETUP.md`
