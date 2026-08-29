import { useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { useI18n } from '../i18n';
import { contacts, documents, events, jobs, operations, properties } from '../workspace/demo';
import { money, occupancyLabel, pct, typeLabel, yieldOf } from '../workspace/format';
import { PageHeader, Tabs } from '../workspace/ui';

export function PropertyDetailPage() {
  const { id } = useParams();
  const { locale } = useI18n();
  const fr = locale === 'fr';
  const loc = fr ? 'fr' : 'en';
  const [tab, setTab] = useState('overview');
  const p = properties.find((x) => x.id === id);
  if (!p) return <Navigate to="/app/properties" replace />;

  const y = yieldOf(p.monthlyIncome, p.estimatedValue);
  const docs = documents.filter((d) => d.propertyId === p.id);
  const relatedJobs = jobs.filter((j) => j.propertyId === p.id);
  const ops = operations.filter((o) => o.propertyId === p.id);
  const people = contacts.filter((c) => c.propertyIds.includes(p.id));

  return (
    <>
      <PageHeader
        kicker={fr ? 'Fiche bien' : 'Property'}
        title={p.name}
        actions={
          <>
            <Link className="btn secondary" to={`/app/properties/${p.id}/edit`}>
              {fr ? 'Modifier' : 'Edit'}
            </Link>
            <Link className="btn" to="/app/finances">
              {fr ? 'Ajouter une opération' : 'Add a transaction'}
            </Link>
          </>
        }
      />
      <div className="ws-card ws-hero-prop">
        <img src={p.photo} alt="" />
        <div>
          <p className="muted">{p.address}</p>
          <p>
            <span className={`ws-pill ${p.occupancy}`}>{occupancyLabel[p.occupancy][loc]}</span>
          </p>
          <div className="ws-grid kpi" style={{ marginTop: 12 }}>
            <div>
              <span className="muted">{fr ? 'Valeur' : 'Value'}</span>
              <b>{money(p.estimatedValue)}</b>
            </div>
            <div>
              <span className="muted">{fr ? 'Revenus / mois' : 'Income / mo'}</span>
              <b>{money(p.monthlyIncome)}</b>
            </div>
            <div>
              <span className="muted">{fr ? 'Dépenses / mois' : 'Expenses / mo'}</span>
              <b>{money(p.monthlyExpenses)}</b>
            </div>
            <div>
              <span className="muted">{fr ? 'Rentabilité' : 'Yield'}</span>
              <b>{pct(y)}</b>
            </div>
          </div>
        </div>
      </div>
      <Tabs
        value={tab}
        onChange={setTab}
        tabs={[
          { id: 'overview', label: fr ? 'Vue d’ensemble' : 'Overview' },
          { id: 'finances', label: 'Finances' },
          { id: 'documents', label: 'Documents' },
          { id: 'maintenance', label: 'Maintenance' },
          { id: 'occupation', label: fr ? 'Occupation' : 'Occupancy' },
          { id: 'history', label: fr ? 'Historique' : 'History' },
        ]}
      />
      {tab === 'overview' && (
        <div className="ws-grid two">
          <div className="ws-card">
            <h3>{fr ? 'Caractéristiques' : 'Details'}</h3>
            <p>
              {typeLabel[p.type][loc]} · {p.surface} m² · {p.rooms} {fr ? 'pièces' : 'rooms'} · {p.bedrooms}{' '}
              {fr ? 'chambres' : 'bedrooms'} · {p.yearBuilt}
            </p>
            <p className="muted">{fr ? 'Prochaine échéance' : 'Next due'}: {p.nextDueLabel}</p>
            {p.alert && <p className="error">{p.alert}</p>}
          </div>
          <div className="ws-card">
            <h3>{fr ? 'Contacts associés' : 'Related contacts'}</h3>
            {people.map((c) => (
              <p key={c.id}>
                {c.name} · {c.role}
              </p>
            ))}
          </div>
        </div>
      )}
      {tab === 'finances' && (
        <div className="ws-card">
          <p>
            {fr ? 'Cash-flow mensuel' : 'Monthly cash-flow'} <strong>{money(p.monthlyIncome - p.monthlyExpenses)}</strong>
            {' · '}
            {fr ? 'Brute' : 'Gross'} {pct(y)}
          </p>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>{fr ? 'Libellé' : 'Label'}</th>
                  <th>{fr ? 'Montant' : 'Amount'}</th>
                </tr>
              </thead>
              <tbody>
                {ops.map((o) => (
                  <tr key={o.id}>
                    <td>{o.date}</td>
                    <td>{o.label}</td>
                    <td>
                      {o.kind === 'income' ? '+' : '−'}
                      {money(o.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {tab === 'documents' && (
        <div className="ws-card">
          {docs.map((d) => (
            <p key={d.id}>
              <span className={`ws-pill ${d.status}`}>{d.status}</span> {d.title} · {d.category}
            </p>
          ))}
        </div>
      )}
      {tab === 'maintenance' && (
        <div className="ws-card">
          {relatedJobs.map((j) => (
            <p key={j.id}>
              <strong>{j.title}</strong> · {j.vendor} · {j.status}
            </p>
          ))}
        </div>
      )}
      {tab === 'occupation' && (
        <div className="ws-card">
          <p>
            {occupancyLabel[p.occupancy][loc]} · {p.usage}
          </p>
          {people
            .filter((c) => c.role === 'Locataire')
            .map((c) => (
              <p key={c.id}>
                {c.name} · {c.email} · {c.phone}
              </p>
            ))}
        </div>
      )}
      {tab === 'history' && (
        <div className="ws-card">
          {events
            .filter((e) => e.propertyId === p.id)
            .map((e) => (
              <p key={e.id}>
                {e.date} · {e.title}
              </p>
            ))}
        </div>
      )}
    </>
  );
}
