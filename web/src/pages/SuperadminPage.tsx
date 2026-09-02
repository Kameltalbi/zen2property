import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../auth';
import { BrandLogo } from '../BrandLogo';
import { useI18n, type Locale } from '../i18n';
import { countryLabel, useCountries } from '../lib/countries';

type Stats = {
  totalUsers: number;
  activeSubscriptions: number;
  properties: number;
  tenants: number;
  estimatedMrrUsd: number;
};

type AdminUser = {
  id: string;
  email: string;
  fullName: string;
  countryCode: string;
  plan: 'FREE' | 'SMART' | 'PREMIUM' | 'AGENCY' | 'PRO' | 'INVESTOR';
  subscriptionStatus: string;
  isActive: boolean;
  isAdmin: boolean;
};

type MenuPos = { id: string; top: number; right: number };
type Dialog =
  | { type: 'create' }
  | { type: 'plan'; user: AdminUser }
  | { type: 'extend'; user: AdminUser }
  | { type: 'cancel'; user: AdminUser }
  | { type: 'delete'; user: AdminUser };

const PLANS = ['FREE', 'SMART', 'PREMIUM', 'AGENCY'] as const;

export function SuperadminPage() {
  const { user, loading, logout } = useAuth();
  const { t, locale } = useI18n();
  const countries = useCountries();
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [menu, setMenu] = useState<MenuPos | null>(null);
  const [dialog, setDialog] = useState<Dialog | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  async function load(nextPage = page, search = q) {
    setError('');
    try {
      const [s, list] = await Promise.all([
        api<Stats>('/admin/stats'),
        api<{ users: AdminUser[]; total: number; page: number }>(
          `/admin/users?page=${nextPage}&limit=20&q=${encodeURIComponent(search)}`,
        ),
      ]);
      setStats(s);
      setUsers(list.users);
      setTotal(list.total);
      setPage(list.page);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to load admin data');
    }
  }

  useEffect(() => {
    if (user?.isAdmin) void load(1, '');
  }, [user?.isAdmin]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!menuRef.current?.contains(e.target as Node)) setMenu(null);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setMenu(null);
        if (!busy) setDialog(null);
      }
    }
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [busy]);

  const activeRow = menu ? users.find((row) => row.id === menu.id) : null;
  const isSelf = (row: AdminUser) => row.id === user?.id;

  function openMenu(row: AdminUser, button: HTMLButtonElement) {
    const rect = button.getBoundingClientRect();
    setMenu({
      id: row.id,
      top: rect.bottom + 4,
      right: Math.max(12, window.innerWidth - rect.right),
    });
  }

  async function run(action: () => Promise<void>, ok: string) {
    setError('');
    setNotice('');
    setBusy(true);
    try {
      await action();
      setDialog(null);
      setMenu(null);
      setNotice(ok);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Update failed');
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <p className="admin-main">Loading…</p>;
  if (!user) return <Navigate to="/login" replace />;
  if (!user.isAdmin) return <Navigate to="/app" replace />;

  const pages = Math.max(1, Math.ceil(total / 20));

  return (
    <div className="admin-shell">
      <header className="admin-top">
        <div className="admin-top-inner">
          <Link className="admin-brand" to="/app" aria-label="Rentelyo Superadmin">
            <BrandLogo onDark />
            <span>Superadmin</span>
          </Link>
          <div className="admin-top-actions">
            <Link to="/app">{t.nav.openApp}</Link>
            <button className="btn secondary admin-logout" type="button" onClick={logout}>
              {t.app.logout}
            </button>
          </div>
        </div>
      </header>
      <main className="admin-main">
        {error && <p className="error">{error}</p>}
        {notice && <p className="ok">{notice}</p>}
        {stats && (
          <div className="grid-4" style={{ marginBottom: 24 }}>
            <div className="stat">
              <span className="muted">Total users</span>
              <b>{stats.totalUsers}</b>
            </div>
            <div className="stat">
              <span className="muted">Active subscriptions</span>
              <b>{stats.activeSubscriptions}</b>
            </div>
            <div className="stat">
              <span className="muted">Properties / tenants</span>
              <b>
                {stats.properties} / {stats.tenants}
              </b>
            </div>
            <div className="stat">
              <span className="muted">Estimated MRR</span>
              <b>${stats.estimatedMrrUsd}</b>
            </div>
          </div>
        )}

        <div className="card table-scroll" style={{ padding: 0 }}>
          <div className="page-head" style={{ padding: '16px 18px', marginBottom: 0 }}>
            <h2>Platform users</h2>
            <div className="admin-toolbar">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  void load(1, q);
                }}
              >
                <input
                  placeholder="Search name or email"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                />
              </form>
              <button className="btn clay" type="button" onClick={() => setDialog({ type: 'create' })}>
                Créer un compte
              </button>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th className="admin-actions-col">Actions</th>
                <th>User</th>
                <th>Country</th>
                <th>Plan</th>
                <th>Stripe</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {users.map((row) => (
                <tr key={row.id}>
                  <td className="admin-actions-col">
                    <button
                      className="admin-kebab"
                      type="button"
                      aria-haspopup="menu"
                      aria-expanded={menu?.id === row.id}
                      aria-label={`Actions pour ${row.fullName}`}
                      onMouseDown={(e) => e.stopPropagation()}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (menu?.id === row.id) setMenu(null);
                        else openMenu(row, e.currentTarget);
                      }}
                    >
                      <span aria-hidden>⋮</span>
                    </button>
                  </td>
                  <td>
                    <strong>{row.fullName}</strong>
                    <div className="muted">{row.email}</div>
                  </td>
                  <td>{row.countryCode}</td>
                  <td>
                    <span className={`pill ${row.plan}`}>{row.plan}</span>
                  </td>
                  <td>
                    <span className={`pill ${row.subscriptionStatus}`}>{row.subscriptionStatus}</span>
                  </td>
                  <td>{row.isActive ? 'Active' : 'Disabled'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="muted" style={{ padding: 16 }}>
            Page {page} / {pages} · {total} users
            {page > 1 && (
              <button className="btn ghost" type="button" onClick={() => void load(page - 1)}>
                Previous
              </button>
            )}
            {page < pages && (
              <button className="btn ghost" type="button" onClick={() => void load(page + 1)}>
                Next
              </button>
            )}
          </p>
        </div>
      </main>

      {menu && activeRow && (
        <div
          ref={menuRef}
          className="admin-kebab-menu"
          role="menu"
          style={{ top: menu.top, right: menu.right }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setMenu(null);
              setDialog({ type: 'plan', user: activeRow });
            }}
          >
            Modifier l’abonnement
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setMenu(null);
              setDialog({ type: 'extend', user: activeRow });
            }}
          >
            Prolonger
          </button>
          <button
            type="button"
            role="menuitem"
            disabled={isSelf(activeRow)}
            onClick={() => {
              setMenu(null);
              setDialog({ type: 'cancel', user: activeRow });
            }}
          >
            Abroger
          </button>
          <button
            type="button"
            role="menuitem"
            disabled={isSelf(activeRow)}
            onClick={() =>
              void run(
                () => api(`/admin/users/${activeRow.id}`, {
                  method: 'PATCH',
                  body: JSON.stringify({ isActive: !activeRow.isActive }),
                }),
                activeRow.isActive ? 'Compte désactivé.' : 'Compte réactivé.',
              )
            }
          >
            {activeRow.isActive ? 'Désactiver le compte' : 'Réactiver le compte'}
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setMenu(null);
              setDialog({ type: 'create' });
            }}
          >
            Créer un compte
          </button>
          <button
            type="button"
            role="menuitem"
            className="danger"
            disabled={isSelf(activeRow)}
            onClick={() => {
              setMenu(null);
              setDialog({ type: 'delete', user: activeRow });
            }}
          >
            Supprimer l’organisation
          </button>
        </div>
      )}

      {dialog?.type === 'create' && (
        <CreateAccountDialog
          busy={busy}
          countries={countries}
          locale={locale}
          onClose={() => !busy && setDialog(null)}
          onSubmit={(body) =>
            void run(
              () => api('/admin/users', { method: 'POST', body: JSON.stringify(body) }),
              'Compte créé.',
            )
          }
        />
      )}
      {dialog?.type === 'plan' && (
        <PlanDialog
          busy={busy}
          user={dialog.user}
          onClose={() => !busy && setDialog(null)}
          onSubmit={(plan) =>
            void run(
              () =>
                api(`/admin/users/${dialog.user.id}`, {
                  method: 'PATCH',
                  body: JSON.stringify({ plan }),
                }),
              'Abonnement mis à jour.',
            )
          }
        />
      )}
      {dialog?.type === 'extend' && (
        <ExtendDialog
          busy={busy}
          user={dialog.user}
          onClose={() => !busy && setDialog(null)}
          onSubmit={(body) =>
            void run(
              () =>
                api(`/admin/users/${dialog.user.id}/extend`, {
                  method: 'POST',
                  body: JSON.stringify(body),
                }),
              'Abonnement prolongé.',
            )
          }
        />
      )}
      {dialog?.type === 'cancel' && (
        <ConfirmDialog
          busy={busy}
          title="Abroger l’abonnement"
          body={`Le compte ${dialog.user.email} passera en FREE (annulé dans Rentelyo). Cela n’annule pas automatiquement Stripe.`}
          confirm="Abroger"
          danger
          onClose={() => !busy && setDialog(null)}
          onConfirm={() =>
            void run(
              () => api(`/admin/users/${dialog.user.id}/cancel`, { method: 'POST' }),
              'Abonnement abrogé.',
            )
          }
        />
      )}
      {dialog?.type === 'delete' && (
        <ConfirmDialog
          busy={busy}
          title="Supprimer l’organisation"
          body={`Supprimer définitivement ${dialog.user.fullName} (${dialog.user.email}) et toutes ses données locatives ?`}
          confirm="Supprimer"
          danger
          onClose={() => !busy && setDialog(null)}
          onConfirm={() =>
            void run(
              () => api(`/admin/users/${dialog.user.id}`, { method: 'DELETE' }),
              'Organisation supprimée.',
            )
          }
        />
      )}
    </div>
  );
}

function CreateAccountDialog({
  busy,
  countries,
  locale,
  onClose,
  onSubmit,
}: {
  busy: boolean;
  countries: { code: string; name: string }[];
  locale: Locale;
  onClose: () => void;
  onSubmit: (body: {
    email: string;
    password: string;
    fullName: string;
    countryCode: string;
    plan: string;
  }) => void;
}) {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    countryCode: 'TN',
    plan: 'FREE',
  });

  function submit(e: FormEvent) {
    e.preventDefault();
    onSubmit(form);
  }

  return (
    <div className="ws-modal" onClick={onClose}>
      <form className="ws-modal-card" onClick={(e) => e.stopPropagation()} onSubmit={submit}>
        <h3>Créer un compte</h3>
        <label>
          Nom
          <input
            required
            value={form.fullName}
            onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
          />
        </label>
        <label>
          E-mail
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          />
        </label>
        <label>
          Mot de passe temporaire
          <input
            type="password"
            required
            minLength={8}
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
          />
        </label>
        <label>
          Pays
          <select
            value={form.countryCode}
            onChange={(e) => setForm((f) => ({ ...f, countryCode: e.target.value }))}
          >
            {countries.map((c) => (
              <option key={c.code} value={c.code}>
                {countryLabel(c.code, locale)} — {c.code}
              </option>
            ))}
          </select>
        </label>
        <label>
          Abonnement
          <select value={form.plan} onChange={(e) => setForm((f) => ({ ...f, plan: e.target.value }))}>
            {PLANS.map((plan) => (
              <option key={plan} value={plan}>
                {plan}
              </option>
            ))}
          </select>
        </label>
        <div className="admin-dialog-actions">
          <button className="btn secondary" type="button" disabled={busy} onClick={onClose}>
            Annuler
          </button>
          <button className="btn clay" type="submit" disabled={busy}>
            {busy ? 'Création…' : 'Créer'}
          </button>
        </div>
      </form>
    </div>
  );
}

function PlanDialog({
  busy,
  user,
  onClose,
  onSubmit,
}: {
  busy: boolean;
  user: AdminUser;
  onClose: () => void;
  onSubmit: (plan: string) => void;
}) {
  const [plan, setPlan] = useState(user.plan === 'INVESTOR' ? 'PREMIUM' : user.plan === 'PRO' ? 'AGENCY' : user.plan);

  return (
    <div className="ws-modal" onClick={onClose}>
      <form
        className="ws-modal-card"
        onClick={(e) => e.stopPropagation()}
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit(plan);
        }}
      >
        <h3>Modifier l’abonnement</h3>
        <p className="muted">{user.email}</p>
        <label>
          Offre
          <select value={plan} onChange={(e) => setPlan(e.target.value as (typeof PLANS)[number])}>
            {PLANS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </label>
        <div className="admin-dialog-actions">
          <button className="btn secondary" type="button" disabled={busy} onClick={onClose}>
            Annuler
          </button>
          <button className="btn clay" type="submit" disabled={busy}>
            Enregistrer
          </button>
        </div>
      </form>
    </div>
  );
}

function ExtendDialog({
  busy,
  user,
  onClose,
  onSubmit,
}: {
  busy: boolean;
  user: AdminUser;
  onClose: () => void;
  onSubmit: (body: { plan?: string; period: 'monthly' | 'yearly' }) => void;
}) {
  const paid = user.plan === 'SMART' || user.plan === 'PREMIUM' || user.plan === 'AGENCY';
  const [plan, setPlan] = useState(paid ? user.plan : 'SMART');
  const [period, setPeriod] = useState<'monthly' | 'yearly'>('monthly');

  return (
    <div className="ws-modal" onClick={onClose}>
      <form
        className="ws-modal-card"
        onClick={(e) => e.stopPropagation()}
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit({ plan, period });
        }}
      >
        <h3>Prolonger l’abonnement</h3>
        <p className="muted">{user.email}</p>
        <label>
          Offre
          <select value={plan} onChange={(e) => setPlan(e.target.value as 'SMART' | 'PREMIUM' | 'AGENCY')}>
            <option value="SMART">SMART</option>
            <option value="PREMIUM">PREMIUM</option>
            <option value="AGENCY">AGENCY</option>
          </select>
        </label>
        <label>
          Durée
          <select value={period} onChange={(e) => setPeriod(e.target.value as 'monthly' | 'yearly')}>
            <option value="monthly">+ 1 mois</option>
            <option value="yearly">+ 1 an</option>
          </select>
        </label>
        <div className="admin-dialog-actions">
          <button className="btn secondary" type="button" disabled={busy} onClick={onClose}>
            Annuler
          </button>
          <button className="btn clay" type="submit" disabled={busy}>
            Prolonger
          </button>
        </div>
      </form>
    </div>
  );
}

function ConfirmDialog({
  busy,
  title,
  body,
  confirm,
  danger,
  onClose,
  onConfirm,
}: {
  busy: boolean;
  title: string;
  body: string;
  confirm: string;
  danger?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="ws-modal" onClick={onClose}>
      <div className="ws-modal-card" onClick={(e) => e.stopPropagation()}>
        <h3>{title}</h3>
        <p>{body}</p>
        <div className="admin-dialog-actions">
          <button className="btn secondary" type="button" disabled={busy} onClick={onClose}>
            Annuler
          </button>
          <button className={`btn ${danger ? 'danger' : 'clay'}`} type="button" disabled={busy} onClick={onConfirm}>
            {busy ? '…' : confirm}
          </button>
        </div>
      </div>
    </div>
  );
}
