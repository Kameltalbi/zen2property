import { useState } from 'react';
import { NavLink, Navigate, Outlet, Link } from 'react-router-dom';
import { BrandLogo } from './BrandLogo';
import { useAuth } from './auth';
import { useI18n } from './i18n';

function LangToggle() {
  const { locale, setLocale } = useI18n();
  return (
    <div className="lang-toggle" role="group" aria-label="Language">
      <button type="button" className={locale === 'fr' ? 'on' : ''} onClick={() => setLocale('fr')}>
        FR
      </button>
      <button type="button" className={locale === 'en' ? 'on' : ''} onClick={() => setLocale('en')}>
        EN
      </button>
    </div>
  );
}

export function PublicLayout() {
  const { user } = useAuth();
  const { t } = useI18n();
  const [open, setOpen] = useState(false);

  function close() {
    setOpen(false);
  }

  return (
    <>
      <header className="container topnav">
        <Link className="brand" to="/" onClick={close} aria-label="Zen2Property">
          <BrandLogo />
        </Link>
        <div className="nav-toolbar">
          <LangToggle />
          <button
            type="button"
            className="nav-toggle"
            aria-expanded={open}
            aria-controls="public-nav"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? t.nav.close : t.nav.menu}
          </button>
        </div>
        <nav id="public-nav" className={`nav-panel ${open ? 'is-open' : ''}`}>
          <div className="nav-links">
            <Link to="/#features" onClick={close}>
              {t.nav.features}
            </Link>
            <Link to="/pricing" onClick={close}>
              {t.nav.pricing}
            </Link>
            <Link to="/#faq" onClick={close}>
              {t.nav.faq}
            </Link>
          </div>
          <div className="nav-links nav-actions">
            {user ? (
              <Link className="btn" to="/app" onClick={close}>
                {t.nav.openApp}
              </Link>
            ) : (
              <>
                <Link to="/login" onClick={close}>
                  {t.nav.login}
                </Link>
                <Link className="btn" to="/signup" onClick={close}>
                  {t.nav.start}
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>
      <Outlet />
      <footer className="site-footer">
        <div className="container footer-grid">
          <div>
            <Link className="brand" to="/" aria-label="Zen2Property">
              <BrandLogo />
            </Link>
            <p className="muted">{t.footer.blurb}</p>
          </div>
          <div>
            <h3>{t.footer.product}</h3>
            <Link to="/#features">{t.nav.features}</Link>
            <Link to="/pricing">{t.nav.pricing}</Link>
            <Link to="/#faq">{t.nav.faq}</Link>
          </div>
          <div>
            <h3>{t.footer.account}</h3>
            <Link to="/login">{t.nav.login}</Link>
            <Link to="/forgot-password">{t.footer.reset}</Link>
          </div>
          <div>
            <h3>{t.footer.legal}</h3>
            <Link to="/privacy">{t.footer.privacy}</Link>
            <Link to="/terms">{t.footer.terms}</Link>
          </div>
        </div>
        <p className="container footer-copy muted">© {new Date().getFullYear()} Zen2Property</p>
      </footer>
    </>
  );
}

export function AppLayout() {
  const { user, loading, logout } = useAuth();
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  if (loading) return <p className="container">Loading…</p>;
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="app-shell">
      <aside className={`sidenav ${open ? 'is-open' : ''}`}>
        <div className="sidenav-head">
          <Link className="brand" to="/app" onClick={() => setOpen(false)} aria-label="Zen2Property">
            <BrandLogo />
          </Link>
          <button
            type="button"
            className="nav-toggle"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? t.nav.close : t.nav.menu}
          </button>
        </div>
        <nav className="sidenav-links" onClick={() => setOpen(false)}>
          <NavLink to="/app" end>
            Dashboard
          </NavLink>
          <NavLink to="/app/properties">Properties</NavLink>
          <NavLink to="/app/tenants">Tenants</NavLink>
          <NavLink to="/app/rent">Rent & receipts</NavLink>
          <NavLink to="/app/settings">Settings</NavLink>
          {user.isAdmin && <NavLink to="/superadmin">Superadmin</NavLink>}
        </nav>
        <div className="sidenav-foot">
          <span className="muted sidenav-user">
            {user.fullName} · {user.plan}
          </span>
          <button className="btn secondary sidenav-logout" onClick={logout}>
            Log out
          </button>
        </div>
      </aside>
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
