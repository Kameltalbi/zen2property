import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../auth';
import { BrandLogo } from '../BrandLogo';
import { useI18n } from '../i18n';

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

export function SuperadminPage() {
  const { user, loading, logout } = useAuth();
  const { t } = useI18n();
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const [error, setError] = useState('');

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

  async function patch(id: string, body: object) {
    setError('');
    try {
      await api(`/admin/users/${id}`, { method: 'PATCH', body: JSON.stringify(body) });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Update failed');
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
          </div>
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Country</th>
                <th>Plan</th>
                <th>Stripe</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {users.map((row) => (
                <tr key={row.id}>
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
                  <td className="row-actions">
                    <select
                      value={row.plan}
                      onChange={(e) => void patch(row.id, { plan: e.target.value })}
                      disabled={row.id === user.id}
                    >
                      <option value="FREE">FREE</option>
                      <option value="SMART">SMART</option>
                      <option value="PREMIUM">PREMIUM</option>
                      <option value="AGENCY">AGENCY</option>
                    </select>
                    <button
                      className="btn secondary"
                      type="button"
                      disabled={row.id === user.id}
                      onClick={() => void patch(row.id, { isActive: !row.isActive })}
                    >
                      {row.isActive ? 'Disable' : 'Enable'}
                    </button>
                  </td>
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
    </div>
  );
}
