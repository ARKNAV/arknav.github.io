import { siteUrl } from '@/lib/blog';

const socials = [
  { label: 'Email', detail: 'aketineni3@gatech.edu', href: 'mailto:aketineni3@gatech.edu' },
  { label: 'LinkedIn', detail: 'linkedin.com/in/aketineni', href: 'https://www.linkedin.com/in/aketineni/' },
  { label: 'GitHub', detail: 'github.com/arknav', href: 'https://github.com/arknav' },
];

const projects = [
  {
    title: 'League of Legends Strategy Explorer',
    category: 'Game Analytics',
    description: 'Analyzing 100,000+ high-level matches with graph-based models and an interactive dashboard to explore team positioning, objectives, and win probability.',
  },
  {
    title: 'Memory in Motion',
    category: 'Reinforcement Learning',
    description: 'Building a fighting-game benchmark to study how AI agents use past actions and hidden information to make better decisions.',
  },
  {
    title: 'Language-Guided Robot Learning',
    category: 'Embodied AI',
    description: 'A research proposal exploring whether training-data changes, prompt rewriting, and feedback can improve instruction following in vision-language-action models.',
  },
];

export default function Home() {
  return (
    <div className="site-shell">
      <a className="skip-link" href="#main">Skip to content</a>
      <header className="site-header">
        <a className="wordmark" href="#main" aria-label="Arnav Ketineni home">ARK<span aria-hidden="true">.</span></a>
        <nav aria-label="Main navigation">
          <a href="#about">About</a><a href="#education">Education</a><a href="#experience">Experience</a><a href="#projects">Projects</a><a href="#resume">Résumé</a><a href={siteUrl('/blog/')}>Blog</a><a href="#contact">Contact <span aria-hidden="true">↗</span></a>
        </nav>
      </header>
      <main id="main">
        <section className="intro" aria-labelledby="intro-title">
          <p className="eyebrow"><span className="status-dot" aria-hidden="true" />Computer Science · Georgia Tech</p>
          <h1 id="intro-title"><span className="intro-greeting">Hi, I’m</span><span className="intro-name">Arnav Ketineni<span className="name-period">.</span></span></h1>
          <div id="about" className="bio-block">
            <p className="section-label">01 / About</p>
            <p className="bio-placeholder">I’m a computer science student at Georgia Tech with a curiosity for how technology can shape the way we live and work. I’m drawn to meaningful problems, new ideas, and opportunities to turn what I learn into something useful. I’m looking for opportunities to apply AI and machine learning to meaningful challenges and build things that help people.</p>
          </div>
        </section>
        <section id="education" className="education" aria-labelledby="education-title">
          <div className="section-heading"><h2 id="education-title">Education</h2><span className="section-label">02 / Education</span></div>
          <article className="experience-placeholder">
            <p className="experience-dates">Expected December 2027</p>
            <div>
              <h3>Georgia Institute of Technology</h3>
              <p className="experience-organization">Master’s in Computer Science</p>
              <p className="coursework-label">Relevant coursework</p><ul className="coursework"><li>Machine Learning</li><li>Natural Language Processing</li><li>Game AI</li></ul>
            </div>
          </article>
          <article className="experience-placeholder">
            <p className="experience-dates">Expected December 2026</p>
            <div>
              <h3>Georgia Institute of Technology</h3>
              <p className="experience-organization">Bachelor’s in Computer Science</p>
              <p className="coursework-label">Relevant coursework</p><ul className="coursework"><li>Design of Algorithms</li><li>Computer Graphics</li><li>Information Visualization</li></ul>
            </div>
          </article>
        </section>
        <section id="experience" className="experience" aria-labelledby="experience-title">
          <div className="section-heading"><h2 id="experience-title">Professional Experience</h2><span className="section-label">03 / Experience</span></div>
          <article className="experience-placeholder">
            <p className="experience-dates">May 2026 — August 2026</p>
            <div>
              <h3>Software Engineering Intern</h3>
              <p className="experience-organization">Amazon Web Services (AWS)</p>
              <p>Built agentic AI tools for infrastructure security, automating ticket resolution and incident triage.</p>
            </div>
          </article>
          <article className="experience-placeholder">
            <p className="experience-dates">May 2025 — August 2025</p>
            <div>
              <h3>AI/ML Software Engineer Intern</h3>
              <p className="experience-organization">ScreenZen LLC</p>
              <p>Built personalized puzzle challenges and cross-device analytics to help users reduce screen time.</p>
            </div>
          </article>
        </section>
        <section id="projects" className="projects" aria-labelledby="projects-title">
          <div className="section-heading"><h2 id="projects-title">Projects</h2><span className="section-label">04 / Selected work</span></div>
          <div className="project-grid">
            {projects.map((project, index) => (
              <article className="project-card" key={project.title}>
                <span className="project-number" aria-hidden="true">0{index + 1}</span>
                <div className="project-heading"><p className="project-category">{project.category}</p><h3>{project.title}</h3></div>
                <p className="project-description">{project.description}</p>
              </article>
            ))}
          </div>
        </section>
        <section id="resume" className="resume" aria-labelledby="resume-title">
          <div className="section-heading"><h2 id="resume-title">Résumé</h2><span className="section-label">05 / Résumé</span></div>
          <div className="resume-placeholder">
            <div><h3>[Résumé PDF]</h3><p>Résumé coming soon.</p></div>
            <span className="coming-soon">Not yet available</span>
          </div>
        </section>
        <section id="contact" className="contact" aria-labelledby="contact-title">
          <div><p className="section-label">06 / Contact</p><h2 id="contact-title">Let’s connect<span>.</span></h2></div>
          <div className="social-links">{socials.map((social) => <a key={social.label} href={social.href}><span><strong>{social.label}</strong><span className="social-detail">{social.detail}</span></span><span className="arrow" aria-hidden="true">↗</span></a>)}</div>
        </section>
      </main>
      <footer><span>© {new Date().getFullYear()} Arnav Ketineni</span><a href="#main">Back to top ↑</a></footer>
    </div>
  );
}
