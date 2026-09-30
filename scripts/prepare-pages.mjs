import { copyFileSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import path from 'node:path';

// Vinext's trailingSlash export currently redirects dynamic prerender requests.
// Keep its normal export, then provide directory entrypoints for GitHub Pages.
// Retain flat HTML/RSC files for Vinext's client routing and existing URLs.
const output = path.resolve('dist/client');
function collectHtml(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) return collectHtml(file);
    return entry.name.endsWith('.html') && !['index.html', '404.html'].includes(entry.name) ? [file] : [];
  });
}
for (const file of collectHtml(output)) {
  const directory = file.slice(0, -5);
  mkdirSync(directory, { recursive: true });
  copyFileSync(file, path.join(directory, 'index.html'));
  const rsc = `${directory}.rsc`;
  if (existsSync(rsc)) copyFileSync(rsc, path.join(directory, 'index.rsc'));
}
console.log('GitHub Pages directory entrypoints prepared.');
