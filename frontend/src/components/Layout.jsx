export default function Layout({ mode, title, subtitle, onBack, children }) {
  return (
    <div className="app-shell">
      <header className="site-header">
        <button className="logo-button" type="button" onClick={onBack}>
          FIREFLOW.AI <span>MVP</span>
        </button>
        <nav className="top-nav" aria-label="FireFlow role navigation">
          <button type="button" onClick={onBack}>ROLE SELECT</button>
          <span>{mode}</span>
        </nav>
      </header>

      <main>
        <section className="page-hero container">
          <span className="eyebrow">{mode}</span>
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </section>
        {children}
      </main>

      <footer className="site-footer">
        <div>
          <strong>FIREFLOW</strong>
          <p>Critical response MVP. Dummy data only.</p>
        </div>
        <span>V0.1.0 / MAIN READY</span>
      </footer>
    </div>
  );
}
