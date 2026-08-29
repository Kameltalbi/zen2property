import { useState } from 'react';
import { NavLink, Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import { BrandLogo } from './BrandLogo';
import { homePath } from './api';
import { useAuth } from './auth';
import { useI18n } from './i18n';
import { CoachChat } from './onboarding/CoachChat';

function FlagFr() {
  return (
    <svg className="lang-flag" viewBox="0 0 24 16" width="22" height="15" aria-hidden>
      <rect width="8" height="16" fill="#002395" />
      <rect x="8" width="8" height="16" fill="#fff" />
      <rect x="16" width="8" height="16" fill="#ed2939" />
    </svg>
  );
}

function FlagEn() {
  return (
    <svg className="lang-flag" viewBox="0 0 24 16" width="22" height="15" aria-hidden>
      <rect width="24" height="16" fill="#012169" />
      <path d="M0 0 L24 16 M24 0 L0 16" stroke="#fff" strokeWidth="3.2" />
      <path d="M0 0 L24 16 M24 0 L0 16" stroke="#C8102E" strokeWidth="1.6" />
      <path d="M12 0 V16 M0 8 H24" stroke="#fff" strokeWidth="5" />
      <path d="M12 0 V16 M0 8 H24" stroke="#C8102E" strokeWidth="2.6" />
    </svg>
  );
}

function LangToggle() {
  const { locale, setLocale, t } = useI18n();
  return (
    <div className="lang-switch" role="group" aria-label={t.nav.language}>
      <button
        type="button"
        className={locale === 'fr' ? 'on' : ''}
        aria-pressed={locale === 'fr'}
        aria-label="Français"
        title="Français"
        onClick={() => setLocale('fr')}
      >
        <FlagFr />
      </button>
      <button
        type="button"
        className={locale === 'en' ? 'on' : ''}
        aria-pressed={locale === 'en'}
        aria-label="English"
        title="English"
        onClick={() => setLocale('en')}
      >
        <FlagEn />
      </button>
    </div>
  );
}

export function PublicLayout() {
  const { user } = useAuth();
  const { t } = useI18n();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const isHome = pathname === '/';

  function close() {
    setOpen(false);
  }

  return (
    <div className={`public-shell${isHome ? ' is-home' : ''}`}>
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
            <LangToggle />
            {user ? (
              <Link className="btn" to={homePath(user)} onClick={close}>
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
    </div>
  );
}

export function AppLayout() {
  const { user, loading, logout } = useAuth();
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  if (loading) return <p className="app-main">Loading…</p>;
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
            {t.app.dashboard}
          </NavLink>
          <NavLink to="/app/properties">{t.app.properties}</NavLink>
          <NavLink to="/app/tenants">{t.app.tenants}</NavLink>
          <NavLink to="/app/leases">{t.app.leases}</NavLink>
          <NavLink to="/app/finances">{t.app.finances}</NavLink>
          <NavLink to="/app/documents">{t.app.documents}</NavLink>
          <NavLink to="/app/maintenance">{t.app.maintenance}</NavLink>
          <NavLink to="/app/calendar">{t.app.calendar}</NavLink>
          <NavLink to="/app/contacts">{t.app.contacts}</NavLink>
          <NavLink to="/app/reports">{t.app.reports}</NavLink>
          <NavLink to="/app/settings">{t.app.settings}</NavLink>
          {user.isAdmin && <NavLink to="/superadmin">Superadmin</NavLink>}
        </nav>
        <Link className="btn clay sidenav-add" to="/app/properties/new" onClick={() => setOpen(false)}>
          + {t.app.addProperty}
        </Link>
      </aside>
      <div className="app-body">
        <header className="app-header">
          <Link className="app-header-profile" to="/app/settings" onClick={() => setOpen(false)}>
            <span className="app-header-avatar" aria-hidden>
              {user.fullName
                .split(/\s+/)
                .filter(Boolean)
                .slice(0, 2)
                .map((p) => p[0])
                .join('')
                .toUpperCase()}
            </span>
            <span className="app-header-meta">
              <strong>{user.fullName}</strong>
              <small>{user.plan}</small>
            </span>
          </Link>
          <LangToggle />
          <button className="btn secondary app-header-logout" type="button" onClick={logout}>
            {t.app.logout}
          </button>
        </header>
        <main className="app-main">
          <Outlet />
        </main>
      </div>
      <CoachChat />
      <Link className="ws-fab" to="/app/properties/new" aria-label={t.app.addProperty}>
        +
      </Link>
    </div>
  );
}
