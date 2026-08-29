import { useMemo, useState } from 'react';
import { useI18n } from '../i18n';
import { BarsChart, Donut } from '../workspace/charts';
import { operations, properties, series } from '../workspace/demo';
import { money, pct, yieldOf } from '../workspace/format';
import { PageHeader, StatCard } from '../workspace/ui';

export function FinancesPage() {
  const { locale } = useI18n();
  const fr = locale === 'fr';
  const [q, setQ] = useState('');
  const [kind, setKind] = useState('');
  const income = properties.reduce((s, p) => s + p.monthlyIncome, 0);
  const expense = properties.reduce((s, p) => s + p.monthlyExpenses, 0);
  const value = properties.reduce((s, p) => s + p.estimatedValue, 0);
  const ops = operations.filter((o) => {
    if (kind && o.kind !== kind) return false;
    return `${o.label} ${o.category}`.toLowerCase().includes(q.toLowerCase());
  });
  const byCat = useMemo(() => {
    const map = new Map<string, number>();
    operations.filter((o) => o.kind === 'expense').forEach((o) => map.set(o.category, (map.get(o.category) ?? 0) + o.amount));
    const colors = ['#12372A', '#B45A33', '#5B6B7C', '#3d5c4e', '#8a6a4a'];
    return [...map.entries()].map(([label, val], i) => ({ label, value: val, color: colors[i % colors.length] }));
  }, []);

  return (
    <>
      <PageHeader kicker="Finances" title={fr ? 'Vue consolidée' : 'Consolidated view'} />
      <div className="ws-grid kpi">
        <StatCard label={fr ? 'Revenus / mois' : 'Income / mo'} value={money(income)} />
        <StatCard label={fr ? 'Dépenses / mois' : 'Expenses / mo'} value={money(expense)} />
        <StatCard label="Cash-flow" value={money(income - expense)} />
        <StatCard label={fr ? 'Rentabilité moy.' : 'Avg yield'} value={pct(yieldOf(income, value))} />
      </div>
      <div className="ws-grid two" style={{ marginTop: 16 }}>
        <div className="ws-card">
          <h3>{fr ? 'Revenus contre dépenses' : 'Income vs expenses'}</h3>
          <BarsChart data={series['6m']} />
        </div>
        <div className="ws-card">
          <h3>{fr ? 'Répartition des dépenses' : 'Expense mix'}</h3>
          <Donut slices={byCat} />
        </div>
      </div>
      <div className="ws-card" style={{ marginTop: 16 }}>
        <h3>{fr ? 'Rentabilité par bien' : 'Yield by property'}</h3>
        {properties.map((p) => (
          <p key={p.id}>
            {p.name} · {pct(yieldOf(p.monthlyIncome, p.estimatedValue))}
          </p>
        ))}
      </div>
      <div className="ws-toolbar" style={{ marginTop: 16 }}>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={fr ? 'Rechercher une opération' : 'Search transactions'} />
        <select value={kind} onChange={(e) => setKind(e.target.value)}>
          <option value="">{fr ? 'Toutes' : 'All'}</option>
          <option value="income">{fr ? 'Recettes' : 'Income'}</option>
          <option value="expense">{fr ? 'Dépenses' : 'Expenses'}</option>
        </select>
        <button className="btn secondary" type="button">
          CSV
        </button>
        <button className="btn secondary" type="button">
          Excel
        </button>
        <button className="btn secondary" type="button">
          PDF
        </button>
      </div>
      <div className="card table-scroll" style={{ padding: 0 }}>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>{fr ? 'Bien' : 'Property'}</th>
              <th>{fr ? 'Libellé' : 'Label'}</th>
              <th>{fr ? 'Montant' : 'Amount'}</th>
            </tr>
          </thead>
          <tbody>
            {ops.map((o) => (
              <tr key={o.id}>
                <td>{o.date}</td>
                <td>{properties.find((p) => p.id === o.propertyId)?.name}</td>
                <td>
                  {o.category} · {o.label}
                </td>
                <td>
                  {o.kind === 'income' ? '+' : '−'}
                  {money(o.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
