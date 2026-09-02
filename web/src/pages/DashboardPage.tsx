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
  if (!dashboard) return <LoadingState label={locale === 'fr' ? 'Chargement du tableau de bord…' : 'Loading dashboard…'} />;

  return (
    <>
      <PageHeader
        kicker={t.app.dashboard}
        title={`${locale === 'fr' ? 'Bonjour' : 'Hello'}, ${user?.fullName.split(' ')[0]}`}
        actions={
          <div className="ws-actions">
            <Link className="btn secondary" to="/app/leases/new">
              + {locale === 'fr' ? 'Nouvelle location' : 'New lease'}
            </Link>
            <Link className="btn secondary" to="/app/tenants/new">
              + {t.app.addTenant}
            </Link>
          </div>
        }
      />
      <div className="ws-grid kpi">
        <StatCard label={locale === 'fr' ? 'Total des biens' : 'Total properties'} value={String(dashboard.totalProperties)} />
        <StatCard label={locale === 'fr' ? 'Biens loués' : 'Rented properties'} value={String(dashboard.occupiedUnits)} />
        <StatCard label={locale === 'fr' ? 'Biens disponibles' : 'Available properties'} value={String(dashboard.vacantUnits)} />
        <StatCard label={locale === 'fr' ? 'Loyers attendus ce mois' : 'Rent expected this month'} value={money(dashboard.expectedThisMonth, user?.defaultCurrency)} />
        <StatCard label={locale === 'fr' ? 'Loyers encaissés' : 'Rent collected'} value={money(dashboard.collectedThisMonth, user?.defaultCurrency)} />
        <StatCard label={locale === 'fr' ? 'Dépenses du mois' : 'Monthly expenses'} value={money(dashboard.expensesThisMonth, user?.defaultCurrency)} />
        <StatCard label={locale === 'fr' ? 'Revenu net' : 'Net income'} value={money(dashboard.netThisMonth, user?.defaultCurrency)} />
        <StatCard label={locale === 'fr' ? 'Loyers en retard' : 'Overdue rent'} value={String(dashboard.lateCount)} />
      </div>
      <div className="ws-grid two" style={{ marginTop: 16 }}>
        <div className="ws-card">
          <h3>{locale === 'fr' ? 'À faire' : 'To do'}</h3>
          <ul className="ws-list">
            {dashboard.alerts.map((alert) => (
              <li key={`${alert.kind}-${alert.id}`}>
                <Link to="/app/rent">{alert.title}</Link>
              </li>
            ))}
            {!dashboard.alerts.length && <li className="muted">{locale === 'fr' ? 'Aucune action urgente.' : 'Nothing urgent.'}</li>}
          </ul>
        </div>
        <div className="ws-card">
          <h3>{locale === 'fr' ? 'Résumé' : 'Summary'}</h3>
          <ul className="ws-list">
            <li>{locale === 'fr' ? 'Paiements à venir' : 'Upcoming payments'} : {dashboard.pendingCount}</li>
            <li>{locale === 'fr' ? 'Paiements en retard' : 'Overdue payments'} : {dashboard.lateCount}</li>
          </ul>
        </div>
      </div>
    </>
  );
}
