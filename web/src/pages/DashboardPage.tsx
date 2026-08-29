import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth';
import { useI18n } from '../i18n';
import { BarsChart, Donut } from '../workspace/charts';
import { activity, documents, events, jobs, properties, recentIds, series } from '../workspace/demo';
import { formatDate, money, occupancyLabel, pct, typeLabel, yieldOf } from '../workspace/format';
import type { PeriodKey } from '../workspace/types';
import { PageHeader, PeriodSelect, StatCard } from '../workspace/ui';

export function DashboardPage() {
  const { user } = useAuth();
  const { t, locale } = useI18n();
  const loc = locale === 'fr' ? 'fr' : 'en';
  const [period, setPeriod] = useState<PeriodKey>('month');

  const stats = useMemo(() => {
    const live = properties.filter((p) => !p.archived);
    const value = live.reduce((s, p) => s + p.estimatedValue, 0);
    const income = live.reduce((s, p) => s + p.monthlyIncome, 0);
    const expense = live.reduce((s, p) => s + p.monthlyExpenses, 0);
    const chart = series[period];
    const factor = period === 'month' ? 1 : period === '3m' ? 3 : period === '6m' ? 6 : 12;
    return {
      value,
      count: live.length,
      income: income * factor,
      expense: expense * factor,
      cash: (income - expense) * factor,
      yield: yieldOf(income, value),
      chart,
    };
  }, [period]);

  const byType = [
    { label: loc === 'fr' ? 'Appartements' : 'Apartments', value: properties.filter((p) => p.type === 'apartment').length, color: '#12372A' },
    { label: loc === 'fr' ? 'Maisons' : 'Houses', value: properties.filter((p) => p.type === 'house').length, color: '#B45A33' },
    { label: loc === 'fr' ? 'Studios' : 'Studios', value: properties.filter((p) => p.type === 'studio').length, color: '#5B6B7C' },
  ];

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
          </div>
        }
      />
      <div className="ws-grid kpi">
        <StatCard label={locale === 'fr' ? 'Patrimoine estimé' : 'Estimated portfolio'} value={money(stats.value)} />
        <StatCard label={locale === 'fr' ? 'Biens' : 'Properties'} value={String(stats.count)} />
        <StatCard label={locale === 'fr' ? 'Revenus' : 'Income'} value={money(stats.income)} />
        <StatCard label={locale === 'fr' ? 'Dépenses' : 'Expenses'} value={money(stats.expense)} />
        <StatCard label="Cash-flow" value={money(stats.cash)} />
        <StatCard label={locale === 'fr' ? 'Rentabilité brute' : 'Gross yield'} value={pct(stats.yield)} />
      </div>
      <div className="ws-grid two" style={{ marginTop: 16 }}>
        <div className="ws-card">
          <h3>{locale === 'fr' ? 'Revenus et dépenses' : 'Income vs expenses'}</h3>
          <BarsChart data={stats.chart} />
        </div>
        <div className="ws-card">
          <h3>{locale === 'fr' ? 'Répartition par type' : 'By type'}</h3>
          <Donut slices={byType} />
        </div>
      </div>
      <div className="ws-grid two" style={{ marginTop: 16 }}>
        <div className="ws-card">
          <h3>{locale === 'fr' ? 'Prochaines échéances' : 'Upcoming due dates'}</h3>
          <ul className="ws-list">
            {events.slice(0, 5).map((e) => (
              <li key={e.id}>
                <strong>{formatDate(e.date, loc)}</strong> · {e.title}
              </li>
            ))}
          </ul>
        </div>
        <div className="ws-card">
          <h3>{locale === 'fr' ? 'Alertes' : 'Alerts'}</h3>
          <ul className="ws-list">
            {properties.filter((p) => p.alert).map((p) => (
              <li key={p.id}>
                <Link to={`/app/properties/${p.id}`}>
                  {p.name} — {p.alert}
                </Link>
              </li>
            ))}
            {jobs.filter((j) => j.priority === 'high').map((j) => (
              <li key={j.id}>
                <Link to="/app/maintenance">{j.title}</Link>
              </li>
            ))}
            {documents.filter((d) => d.status !== 'valid').map((d) => (
              <li key={d.id}>
                <Link to="/app/documents">{d.title}</Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="ws-grid two" style={{ marginTop: 16 }}>
        <div className="ws-card">
          <h3>{locale === 'fr' ? 'Derniers biens consultés' : 'Recently viewed'}</h3>
          <ul className="ws-list">
            {recentIds.map((id) => {
              const p = properties.find((x) => x.id === id);
              if (!p) return null;
              return (
                <li key={id}>
                  <Link to={`/app/properties/${p.id}`}>
                    {p.name} · {typeLabel[p.type][loc]} · {occupancyLabel[p.occupancy][loc]}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
        <div className="ws-card">
          <h3>{locale === 'fr' ? 'Activité récente' : 'Latest activity'}</h3>
          <ul className="ws-list">
            {activity.map((a) => (
              <li key={a.id}>
                <span className="muted">{formatDate(a.at, loc)}</span> · {a.text}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}
