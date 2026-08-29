import { useState } from 'react';
import { useI18n } from '../i18n';
import { jobs, properties } from '../workspace/demo';
import { money, pct, yieldOf } from '../workspace/format';
import { PageHeader, PeriodSelect, StatCard } from '../workspace/ui';
import type { PeriodKey } from '../workspace/types';

export function ReportsPage() {
  const { locale, t } = useI18n();
  const fr = locale === 'fr';
  const [period, setPeriod] = useState<PeriodKey>('year');
  const income = properties.reduce((s, p) => s + p.monthlyIncome, 0);
  const expense = properties.reduce((s, p) => s + p.monthlyExpenses, 0);
  const value = properties.reduce((s, p) => s + p.estimatedValue, 0);

  return (
    <>
      <PageHeader
        kicker={t.app.reports}
        title={fr ? 'Rapports' : 'Reports'}
        actions={
          <PeriodSelect
            value={period}
            onChange={setPeriod}
            labels={{
              month: t.app.periodMonth,
              '3m': t.app.period3m,
              '6m': t.app.period6m,
              year: t.app.periodYear,
            }}
          />
        }
      />
      <div className="ws-grid kpi">
        <StatCard label={fr ? 'Patrimoine' : 'Portfolio'} value={money(value)} />
        <StatCard label="Cash-flow / mois" value={money(income - expense)} />
        <StatCard label={fr ? 'Rentabilité' : 'Yield'} value={pct(yieldOf(income, value))} />
      </div>
      <div className="ws-card" style={{ marginTop: 16 }}>
        <h3>{fr ? 'Dossier par bien' : 'Per-property file'}</h3>
        {properties.map((p) => (
          <p key={p.id}>
            {p.name} · {money(p.estimatedValue)} · {pct(yieldOf(p.monthlyIncome, p.estimatedValue))} ·{' '}
            {jobs.filter((j) => j.propertyId === p.id).length} {fr ? 'interventions' : 'jobs'}
          </p>
        ))}
      </div>
      <div className="ws-actions" style={{ marginTop: 16 }}>
        <button className="btn secondary" type="button">
          PDF
        </button>
        <button className="btn secondary" type="button">
          Excel
        </button>
      </div>
    </>
  );
}
