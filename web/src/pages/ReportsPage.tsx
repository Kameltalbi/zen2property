import { useEffect, useState } from 'react';
import { downloadBlob, api } from '../api';
import { useAuth } from '../auth';
import { useI18n } from '../i18n';
import { money } from '../workspace/format';
import { ErrorState, LoadingState, PageHeader, StatCard } from '../workspace/ui';

type DashboardPayload = {
  expectedThisMonth: number;
  collectedThisMonth: number;
  expensesThisMonth: number;
  netThisMonth: number;
  pendingCount: number;
  lateCount: number;
};

export function ReportsPage() {
  const { locale, t } = useI18n();
  const { user } = useAuth();
  const fr = locale === 'fr';
  const [dashboard, setDashboard] = useState<DashboardPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState('');

  async function load() {
    setError(null);
    setDashboard(await api<DashboardPayload>('/dashboard'));
  }

  useEffect(() => {
    void load().catch((err) => setError(err instanceof Error ? err.message : 'Unable to load reports'));
  }, []);

  async function download(kind: 'rent' | 'expenses' | 'properties') {
    setBusy(kind);
    try {
      await downloadBlob(`/reports/${kind}.csv`, `rentelyo-${kind}.csv`);
    } catch (err) {
      setError(err instanceof Error ? err.message : fr ? 'Export impossible' : 'Export failed');
    } finally {
      setBusy('');
    }
  }

  if (error && !dashboard) return <ErrorState message={error} onRetry={() => void load()} />;
  if (!dashboard) return <LoadingState />;

  return (
    <>
      <PageHeader kicker={t.app.reports} title={fr ? 'Rapports' : 'Reports'} />
      {error && <p className="error">{error}</p>}
      <div className="ws-grid kpi">
        <StatCard label={fr ? 'Loyers attendus ce mois' : 'Expected rent this month'} value={money(dashboard.expectedThisMonth, user?.defaultCurrency, locale)} />
        <StatCard label={fr ? 'Loyers encaissés' : 'Collected rent'} value={money(dashboard.collectedThisMonth, user?.defaultCurrency, locale)} />
        <StatCard label={fr ? 'Dépenses' : 'Expenses'} value={money(dashboard.expensesThisMonth, user?.defaultCurrency, locale)} />
        <StatCard label={fr ? 'Cash-flow net' : 'Net cash flow'} value={money(dashboard.netThisMonth, user?.defaultCurrency, locale)} />
        <StatCard label={fr ? 'En attente' : 'Pending'} value={String(dashboard.pendingCount)} />
        <StatCard label={fr ? 'En retard' : 'Overdue'} value={String(dashboard.lateCount)} />
      </div>
      <div className="ws-card" style={{ marginTop: 16 }}>
        <h3>{fr ? 'Exports CSV' : 'CSV exports'}</h3>
        <p className="muted">
          {fr
            ? 'Les fichiers reprennent uniquement les données de votre compte. Ouvrez-les dans Excel ou Google Sheets.'
            : 'Files contain only your account data. Open them in Excel or Google Sheets.'}
        </p>
        <div className="ws-actions" style={{ marginTop: 12 }}>
          <button className="btn secondary" type="button" disabled={Boolean(busy)} onClick={() => void download('rent')}>
            {busy === 'rent' ? '…' : (fr ? 'Loyers / paiements' : 'Rent / payments')}
          </button>
          <button className="btn secondary" type="button" disabled={Boolean(busy)} onClick={() => void download('expenses')}>
            {busy === 'expenses' ? '…' : (fr ? 'Dépenses' : 'Expenses')}
          </button>
          <button className="btn secondary" type="button" disabled={Boolean(busy)} onClick={() => void download('properties')}>
            {busy === 'properties' ? '…' : (fr ? 'Synthèse par bien' : 'Property summary')}
          </button>
        </div>
      </div>
    </>
  );
}
