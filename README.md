# Arnav Ketineni — personal website

A responsive personal homepage with intentional placeholders for a bio, three projects, experience, education, and a résumé. Contact links point to your email, LinkedIn, and GitHub.

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

Bio and project copy is deliberately left as bracketed placeholders. Project cards are not links until you add actual projects.

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

The static website is generated in `dist/client`. GitHub Pages serves only that directory; no backend is required.

## Add your résumé

Place your PDF in `public/resume.pdf`, then replace the résumé availability label in `app/page.tsx` with a link to the PDF (include `PAGES_BASE_PATH` in its URL for a project repository). The current résumé section intentionally has no download link until a file is supplied.
