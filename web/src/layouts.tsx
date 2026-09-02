import { useState } from 'react';
import { NavLink, Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import { BrandLogo } from './BrandLogo';
import { homePath } from './api';
import { useAuth } from './auth';
import { LOCALES, LOCALE_META, useI18n, type Locale } from './i18n';
import { CoachChat } from './onboarding/CoachChat';

function LangToggle() {
  const { locale, setLocale, t } = useI18n();
  return (
    <div className="lang-switch">
      <select
        className="lang-select"
        value={locale}
        aria-label={t.nav.language}
        onChange={(e) => setLocale(e.target.value as Locale)}
      >
        {LOCALES.map((code) => (
          <option key={code} value={code}>
            {LOCALE_META[code].nativeName}
          </option>
        ))}
      </select>
    </div>
  );
}

export { LangToggle };

export function PublicLayout() {
  const { user } = useAuth();
  const { t } = useI18n();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const isHome = pathname === '/';
  const isAuthPage = pathname === '/login' || pathname === '/signup';

  function close() {
    setOpen(false);
  }

  return (
    <div className={`public-shell${isHome ? ' is-home' : ''}${isAuthPage ? ' is-auth' : ''}`}>
      <header className="container topnav">
        <Link className="brand" to="/" onClick={close} aria-label="Rentelyo">
          <BrandLogo onDark={isHome} />
        </Link>
        <div className="nav-toolbar">
          <button
            type="button"
            className="nav-toggle"
            aria-expanded={open}
            aria-controls="public-nav"
            onClick={() => setOpen((v) => !v)}
          >
            <span className="nav-toggle-icon" aria-hidden>
              {open ? (
                <svg viewBox="0 0 24 24" width="20" height="20">
                  <path fill="currentColor" d="M6.4 5 5 6.4 10.6 12 5 17.6 6.4 19 12 13.4 17.6 19 19 17.6 13.4 12 19 6.4 17.6 5 12 10.6z" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" width="20" height="20">
                  <path fill="currentColor" d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z" />
                </svg>
              )}
            </span>
            <span className="nav-toggle-label">{open ? t.nav.close : t.nav.menu}</span>
          </button>
          <LangToggle />
        </div>
        <nav id="public-nav" className={`nav-panel ${open ? 'is-open' : ''}`}>
          <div className="nav-links">
            <Link to="/features" onClick={close}>
              {t.nav.features}
            </Link>
            <Link to="/#how" onClick={close}>
              {t.nav.how}
            </Link>
            <Link to="/pricing" onClick={close}>
              {t.nav.pricing}
            </Link>
            <Link to="/help" onClick={close}>
              {t.nav.help}
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
        <div className="container footer-simple">
          <Link className="brand" to="/" aria-label="Rentelyo">
            <BrandLogo />
          </Link>
          <nav className="footer-simple-links" aria-label="Rentelyo">
            <Link to="/features">{t.footer.features}</Link>
            <Link to="/#how">{t.nav.how}</Link>
            <Link to="/pricing">{t.nav.pricing}</Link>
            <Link to="/help">{t.nav.help}</Link>
            <Link to="/contact">{t.footer.contact}</Link>
            <Link to="/privacy">{t.footer.privacy}</Link>
            <Link to="/terms">{t.footer.terms}</Link>
          </nav>
          <LangToggle />
        </div>
        <p className="container footer-copy muted">© {new Date().getFullYear()} Rentelyo</p>
      </footer>
    </div>
  );
}

export function AppLayout() {
  const { user, loading, logout } = useAuth();
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  if (loading) return <p className="app-main">{t.pages.loading}</p>;
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="app-shell">
      <aside className={`sidenav ${open ? 'is-open' : ''}`}>
        <div className="sidenav-head">
          <Link className="brand" to="/app" onClick={() => setOpen(false)} aria-label="Rentelyo">
            <BrandLogo onDark />
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
