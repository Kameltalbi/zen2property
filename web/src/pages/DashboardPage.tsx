import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth';
import { useI18n } from '../i18n';
import { api } from '../api';
import { money } from '../workspace/format';
import { ErrorState, LoadingState, PageHeader, StatCard } from '../workspace/ui';

type Dashboard = {
  totalProperties: number;
  occupiedUnits: number;
  vacantUnits: number;
  collectedThisMonth: number;
  expectedThisMonth: number;
  expensesThisMonth: number;
  netThisMonth: number;
  lateCount: number;
  pendingCount: number;
  alerts: { id: string; kind: string; title: string; due_date: string }[];
};

export function DashboardPage() {
  const { user } = useAuth();
  const { t, locale } = useI18n();
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      setError(null);
      setDashboard(await api<Dashboard>('/dashboard'));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load dashboard');
    }
  }

  useEffect(() => { void load(); }, []);

  if (error) return <ErrorState message={error} onRetry={() => void load()} />;
  if (!dashboard) return <LoadingState label={t.pages.loadingDashboard} />;

  return (
    <>
      <PageHeader
        kicker={t.app.dashboard}
        title={`${t.pages.hello}, ${user?.fullName.split(' ')[0]}`}
        actions={
          <div className="ws-actions">
            <Link className="btn secondary" to="/app/leases/new">
              + {t.pages.newLease}
            </Link>
            <Link className="btn secondary" to="/app/tenants/new">
              + {t.app.addTenant}
            </Link>
          </div>
        }
      />
      <div className="ws-grid kpi">
        <StatCard label={t.pages.totalProperties} value={String(dashboard.totalProperties)} />
        <StatCard label={t.pages.rentedProperties} value={String(dashboard.occupiedUnits)} />
        <StatCard label={t.pages.availableProperties} value={String(dashboard.vacantUnits)} />
        <StatCard label={t.pages.rentExpected} value={money(dashboard.expectedThisMonth, user?.defaultCurrency, locale)} />
        <StatCard label={t.pages.rentCollected} value={money(dashboard.collectedThisMonth, user?.defaultCurrency, locale)} />
        <StatCard label={t.pages.monthlyExpenses} value={money(dashboard.expensesThisMonth, user?.defaultCurrency, locale)} />
        <StatCard label={t.pages.netIncome} value={money(dashboard.netThisMonth, user?.defaultCurrency, locale)} />
        <StatCard label={t.pages.overdueRent} value={String(dashboard.lateCount)} />
      </div>
      <div className="ws-grid two" style={{ marginTop: 16 }}>
        <div className="ws-card">
          <h3>{t.pages.toDo}</h3>
          <ul className="ws-list">
            {dashboard.alerts.map((alert) => (
              <li key={`${alert.kind}-${alert.id}`}>
                <Link to="/app/rent">{alert.title}</Link>
              </li>
            ))}
            {!dashboard.alerts.length && <li className="muted">{t.pages.nothingUrgent}</li>}
          </ul>
        </div>
        <div className="ws-card">
          <h3>{t.pages.summary}</h3>
          <ul className="ws-list">
            <li>{t.pages.upcomingPayments} : {dashboard.pendingCount}</li>
            <li>{t.pages.overduePayments} : {dashboard.lateCount}</li>
          </ul>
        </div>
      </div>
    </>
  );
}
