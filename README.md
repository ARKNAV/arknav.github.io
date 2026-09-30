# Arnav Ketineni — personal website

A responsive personal website with projects, experience, education, a résumé section, and a Markdown blog. Contact links point to your email, LinkedIn, and GitHub.

## Preview locally

Use Node.js 22.13 or newer.

```sh
npm ci
npm run dev
```

Open the URL printed by the development server.

## Edit content

- `app/page.tsx`: display name, bio, projects, experience, education, résumé, and social links.
- `app/globals.css`: colors, typography, layout, and responsive styles.
- `app/layout.tsx`: page title and description.
- `public/favicon.svg`: browser icon.

Project cards are not links until you add actual project URLs.

## Publish on GitHub Pages

1. Create an empty public repository named `arknav.github.io` under your `arknav` GitHub account.
2. Push this project to its `main` branch:

   ```sh
   git init -b main
   git add .
   git commit -m "Create personal website"
   git remote add origin https://github.com/arknav/arknav.github.io.git
   git push -u origin main
   ```

3. In the repository, open **Settings → Pages** and set **Source** to **GitHub Actions**.
4. Open **Actions → Deploy to GitHub Pages → Run workflow** if the initial run occurred before Pages was enabled.
5. After the deployment succeeds, visit https://arknav.github.io/.

The included workflow publishes each push to `main`. It also supports project repositories by setting their base path automatically.

## Production build

```sh
npm run build
```

The static website is generated in `dist/client`. GitHub Pages serves only that directory. The optional on-site editor uses a separate GitHub login Worker.

## Add your résumé

Place your PDF in `public/resume.pdf`, then replace the résumé availability label in `app/page.tsx` with a link to the PDF (include `PAGES_BASE_PATH` in its URL for a project repository). The current résumé section intentionally has no download link until a file is supplied.

## Write blog posts from GitHub

The separate blog lives at `/blog/`. Each article is a Markdown file in `content/posts/`; your repository permissions control who can publish. You can edit these files on GitHub or use the on-site editor described below.

1. Sign in to GitHub as `ARKNAV` and open `ARKNAV/arknav.github.io`.
2. Open `content/posts/_TEMPLATE.md` and copy its contents.
3. In `content/posts`, select **Add file → Create new file**. Name it `my-new-post.md`, using lowercase letters, digits, and hyphens. Paste the template, replace the title, date, excerpt, category, tags, and body. Keep the opening `---` at the very start of the file.
4. Commit to `main` (or merge your pull request into `main`). The existing GitHub Pages workflow rebuilds and publishes the blog. The filename becomes `/blog/my-new-post/`.

```yaml
---
title: "A title with a colon: quote it like this"
date: "2026-09-29"
category: Notes
excerpt: A short description for the article card.
tags: [ai, projects]
draft: false
---
```

`title` and a valid `YYYY-MM-DD` date are required. Category, excerpt, tags, and draft are optional. Posts sort newest first; reading time is calculated automatically. Set `draft: true` or start the filename with `_` to keep an article out of the published site. Future dates sort as entered and **do not schedule publishing**. Invalid published post metadata fails the build with the filename so a broken article is not silently omitted.

Markdown supports headings, lists, quotes, links, images, fenced code, and tables. Post titles come from the metadata; begin the body with text or a `##` heading. Store images in `public/blog/` and reference them as `![Descriptive alt text](/blog/photo.jpg)`. Raw HTML is sanitized; scripts and unsafe link schemes are removed. Code blocks are plain text without syntax highlighting.

Preview locally with `npm run dev`, then visit `/blog/` and your article. Each article includes an **Edit this post** link to the on-site editor; saving an edit on `main` republishes it. The included posts are clearly labeled demonstration content: replace or mark them as drafts before publishing your own writing.

## Write directly on the website

An editor at `/admin/` supports GitHub login, Markdown editing, image uploads, drafts, and publishing to the existing repository. Click **Write a post** on the blog to open it. Only `ARKNAV` with repository write access can complete the configured login flow.

The editor is implemented and its login Worker is deployed. Authentication still requires your GitHub OAuth app. Follow [BLOG_ADMIN_SETUP.md](BLOG_ADMIN_SETUP.md) for the remaining setup and publishing instructions. No OAuth credentials are embedded in the website.

### Blog design references

The blog adapts layout patterns from Ghost's open-source [Casper](https://github.com/TryGhost/Casper) and [Edition](https://github.com/TryGhost/Edition) themes: an emphasized latest article, a regular card feed, category/date/reading-time metadata, and a narrow article column. It keeps this website's Georgia headings, navy text, blue accents, and bordered surfaces. No theme code or assets are copied.
