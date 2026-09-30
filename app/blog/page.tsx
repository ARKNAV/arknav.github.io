import type { Metadata } from 'next';
import BlogShell from '@/components/blog-shell';
import { getAllPosts, siteUrl } from '@/lib/blog';

export const metadata: Metadata = {
  title: 'Blog — Arnav Ketineni',
  description: 'Notes on computer science, projects, and things learned along the way.',
};

export default function Blog() {
  const posts = getAllPosts();
  const [latest, ...rest] = posts;
  return (
    <BlogShell>
      <section className="blog-hero" aria-labelledby="blog-title">
        <div><p className="eyebrow">Notes & perspectives</p><h1 id="blog-title">The blog<span>.</span></h1></div>
        <p>Projects, ideas, and things learned along the way.</p>
      </section>
      {latest ? (
        <>
          <section aria-labelledby="latest-title">
            <div className="blog-section-heading"><h2 id="latest-title">Latest writing</h2><span className="section-label">{posts.length} {posts.length === 1 ? 'post' : 'posts'}</span></div>
            <article className="blog-featured">
              <div className="blog-featured-label"><span className="section-label">Latest post</span><span className="blog-featured-number" aria-hidden="true">01</span><span className="blog-pill">{latest.category}</span></div>
              <div className="blog-featured-content">
                <div className="blog-meta"><time dateTime={latest.date}>{latest.dateLabel}</time><span>{latest.readingTime}</span></div>
                <h3><a href={siteUrl(`/blog/${latest.slug}/`)}>{latest.title}</a></h3>
                <p>{latest.excerpt}</p>
                <a className="blog-read" href={siteUrl(`/blog/${latest.slug}/`)}>Read the post <span aria-hidden="true">→</span></a>
              </div>
            </article>
          </section>
          {rest.length > 0 && <section className="blog-archive" aria-labelledby="archive-title">
            <div className="blog-section-heading"><h2 id="archive-title">More writing</h2></div>
            <div className="blog-grid">{rest.map((post) => (
              <article className="blog-card" key={post.slug}>
                <span className="blog-pill">{post.category}</span>
                <h3><a href={siteUrl(`/blog/${post.slug}/`)}>{post.title}</a></h3>
                <p>{post.excerpt}</p>
                <div className="blog-meta"><time dateTime={post.date}>{post.dateLabel}</time><span>{post.readingTime}</span></div>
                <a className="blog-read" href={siteUrl(`/blog/${post.slug}/`)}>Read the post <span aria-hidden="true">→</span></a>
              </article>
            ))}</div>
          </section>}
        </>
      ) : <section className="blog-empty"><h2>Writing starts here.</h2><p>No posts yet. Check back soon.</p></section>}
      <p className="blog-author-link"><a href={siteUrl('/admin/')}>Write a post ↗</a></p>
    </BlogShell>
  );
}
