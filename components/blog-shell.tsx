import { siteUrl } from '@/lib/blog';

export default function BlogShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="site-shell blog-shell">
      <a className="skip-link" href="#main">Skip to content</a>
      <header className="site-header">
        <a className="wordmark" href={siteUrl('/')} aria-label="Arnav Ketineni home">ARK<span aria-hidden="true">.</span></a>
        <nav aria-label="Main navigation">
          <a href={siteUrl('/#about')}>About</a>
          <a href={siteUrl('/#education')}>Education</a>
          <a href={siteUrl('/#experience')}>Experience</a>
          <a href={siteUrl('/#projects')}>Projects</a>
          <a href={siteUrl('/#resume')}>Résumé</a>
          <a href={siteUrl('/blog/')} aria-current="page">Blog</a>
          <a href={siteUrl('/#contact')}>Contact <span aria-hidden="true">↗</span></a>
        </nav>
      </header>
      <main id="main">{children}</main>
      <footer><span>© {new Date().getFullYear()} Arnav Ketineni</span><a href="#main">Back to top ↑</a></footer>
    </div>
  );
}
