import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import BlogShell from '@/components/blog-shell';
import { getAllPosts, getPost, markdownToHtml, siteUrl } from '@/lib/blog';

type Props = { params: Promise<{ slug: string }> };
export function generateStaticParams() {
  return getAllPosts().map(({ slug }) => ({ slug }));
}
export const dynamicParams = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = getPost((await params).slug);
  return post ? { title: `${post.title} — Arnav Ketineni`, description: post.excerpt,
    openGraph: { type: 'article', title: post.title, description: post.excerpt, publishedTime: post.date } } : {};
}

export default async function PostPage({ params }: Props) {
  const post = getPost((await params).slug);
  if (!post) notFound();
  const posts = getAllPosts();
  const index = posts.findIndex(({ slug }) => slug === post.slug);
  const newer = posts[index - 1];
  const older = posts[index + 1];
  return (
    <BlogShell>
      <div className="blog-post-wrap">
        <a className="blog-back" href={siteUrl('/blog/')}>← All posts</a>
        <article>
          <header className="blog-post-header">
            <span className="blog-pill">{post.category}</span>
            <h1>{post.title}</h1>
            <p className="blog-post-excerpt">{post.excerpt}</p>
            <div className="blog-byline"><span>Arnav Ketineni</span><div className="blog-meta"><time dateTime={post.date}>{post.dateLabel}</time><span>{post.readingTime}</span></div></div>
          </header>
          <div className="blog-prose" dangerouslySetInnerHTML={{ __html: markdownToHtml(post.content) }} />
          <div className="blog-post-end">
            <ul className="blog-tags" aria-label="Post topics">{post.tags.map((tag) => <li key={tag}>{tag}</li>)}</ul>
            <a className="blog-source" href={siteUrl(`/admin/#/collections/posts/entries/${post.slug}`)}>Edit this post ↗</a>
          </div>
        </article>
        {(older || newer) && <nav className="blog-prevnext" aria-label="Adjacent posts">
          {older && <a href={siteUrl(`/blog/${older.slug}/`)}><span>← Older post</span><strong>{older.title}</strong></a>}
          {newer && <a href={siteUrl(`/blog/${newer.slug}/`)}><span>Newer post →</span><strong>{newer.title}</strong></a>}
        </nav>}
      </div>
    </BlogShell>
  );
}
