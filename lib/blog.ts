import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { marked } from 'marked';
import sanitizeHtml from 'sanitize-html';

export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  dateLabel: string;
  excerpt: string;
  category: string;
  tags: string[];
  readingTime: string;
  content: string;
}

const postsDirectory = path.join(process.cwd(), 'content/posts');
export const repositoryUrl = 'https://github.com/ARKNAV/arknav.github.io';
export const basePath = process.env.PAGES_BASE_PATH || '';
export function siteUrl(url: string): string {
  return `${basePath}${url}`;
}

export function formatDate(iso: string): string {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC',
  });
}

export function getAllPosts(): BlogPost[] {
  if (!fs.existsSync(postsDirectory)) return [];
  return fs.readdirSync(postsDirectory)
    .filter((file) => file.endsWith('.md') && !file.startsWith('_') && !file.startsWith('.'))
    .map((file): BlogPost | null => {
      const slug = file.slice(0, -3);
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
        throw new Error(`Invalid blog filename: ${file}. Use lowercase words separated by hyphens.`);
      }
      const { data, content } = matter(fs.readFileSync(path.join(postsDirectory, file), 'utf8'));
      if (data.draft === true) return null;
      const date = data.date instanceof Date ? data.date.toISOString().slice(0, 10) : String(data.date ?? '');
      if (typeof data.title !== 'string' || !data.title.trim() || !/^\d{4}-\d{2}-\d{2}$/.test(date)
        || Number.isNaN(Date.parse(`${date}T12:00:00Z`))
        || new Date(`${date}T12:00:00Z`).toISOString().slice(0, 10) !== date) {
        throw new Error(`${file}: title and a valid YYYY-MM-DD date are required.`);
      }
      const plainText = sanitizeHtml(marked.parse(content, { async: false }), { allowedTags: [], allowedAttributes: {} });
      const words = plainText.split(/\s+/).filter(Boolean).length;
      return {
        slug, title: data.title, date, dateLabel: formatDate(date),
        excerpt: typeof data.excerpt === 'string' ? data.excerpt : plainText.replace(/\s+/g, ' ').trim().slice(0, 160),
        category: typeof data.category === 'string' ? data.category : 'Notes',
        tags: Array.isArray(data.tags) ? data.tags.filter((tag): tag is string => typeof tag === 'string') : [],
        readingTime: `${Math.max(1, Math.ceil(words / 200))} min read`, content,
      };
    })
    .filter((post): post is BlogPost => post !== null)
    .sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug));
}

export function getPost(slug: string): BlogPost | null {
  return getAllPosts().find((post) => post.slug === slug) ?? null;
}

export function markdownToHtml(markdown: string): string {
  return sanitizeHtml(marked.parse(markdown, { async: false }), {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      code: ['class'], img: ['src', 'alt', 'title', 'loading'],
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    transformTags: {
      h1: 'h2',
      img: (_tagName, attribs) => ({ tagName: 'img', attribs: { ...attribs, loading: 'lazy', src: attribs.src?.startsWith('/') && !attribs.src.startsWith('//') ? siteUrl(attribs.src) : attribs.src } }),
      a: (_tagName, attribs) => ({ tagName: 'a', attribs: { ...attribs, href: attribs.href?.startsWith('/') && !attribs.href.startsWith('//') ? siteUrl(attribs.href) : attribs.href } }),
    },
  });
}
