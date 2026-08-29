import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../i18n';
import { properties as seed } from '../workspace/demo';
import { money, occupancyLabel, pct, typeLabel, usageLabel, yieldOf } from '../workspace/format';
import type { Occupancy, PropertyType, Usage, WorkspaceProperty } from '../workspace/types';
import { ConfirmDialog, EmptyState, PageHeader } from '../workspace/ui';

export function PropertiesPage() {
  const { t, locale } = useI18n();
  const loc = locale === 'fr' ? 'fr' : 'en';
  const [view, setView] = useState<'cards' | 'table'>('cards');
  const [q, setQ] = useState('');
  const [type, setType] = useState<'' | PropertyType>('');
  const [status, setStatus] = useState<'' | Occupancy>('');
  const [city, setCity] = useState('');
  const [usage, setUsage] = useState<'' | Usage>('');
  const [sort, setSort] = useState('name');
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<WorkspaceProperty[]>(seed);
  const [pending, setPending] = useState<WorkspaceProperty | null>(null);

  const filtered = useMemo(() => {
    let list = items.filter((p) => !p.archived);
    if (q) {
      const n = q.toLowerCase();
      list = list.filter((p) => `${p.name} ${p.address} ${p.city}`.toLowerCase().includes(n));
    }
    if (type) list = list.filter((p) => p.type === type);
    if (status) list = list.filter((p) => p.occupancy === status);
    if (city) list = list.filter((p) => p.city === city);
    if (usage) list = list.filter((p) => p.usage === usage);
    list = [...list].sort((a, b) => {
      if (sort === 'value') return b.estimatedValue - a.estimatedValue;
      if (sort === 'yield') return yieldOf(b.monthlyIncome, b.estimatedValue) - yieldOf(a.monthlyIncome, a.estimatedValue);
      return a.name.localeCompare(b.name);
    });
    return list;
  }, [items, q, type, status, city, usage, sort]);

  const pageSize = 6;
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const slice = filtered.slice((page - 1) * pageSize, page * pageSize);
  const cities = [...new Set(items.map((p) => p.city))];

  if (!items.length) {
    return (
      <EmptyState
        title={locale === 'fr' ? 'Aucun bien' : 'No properties'}
        body={locale === 'fr' ? 'Ajoutez votre premier bien pour suivre patrimoine, loyers et documents.' : 'Add your first property to track value, rent and documents.'}
        action={{ to: '/app/properties/new', label: t.app.addProperty }}
      />
    );
  }

  return (
    <>
      <PageHeader
        kicker={t.app.properties}
        title={t.app.properties}
        actions={
          <Link className="btn clay" to="/app/properties/new">
            + {t.app.addProperty}
          </Link>
        }
      />
      <div className="ws-toolbar">
        <input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder={locale === 'fr' ? 'Rechercher' : 'Search'} />
        <select value={type} onChange={(e) => setType(e.target.value as '' | PropertyType)}>
          <option value="">{locale === 'fr' ? 'Type' : 'Type'}</option>
          <option value="apartment">{typeLabel.apartment[loc]}</option>
          <option value="house">{typeLabel.house[loc]}</option>
          <option value="studio">{typeLabel.studio[loc]}</option>
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value as '' | Occupancy)}>
          <option value="">{locale === 'fr' ? 'Statut' : 'Status'}</option>
          <option value="rented">{occupancyLabel.rented[loc]}</option>
          <option value="vacant">{occupancyLabel.vacant[loc]}</option>
          <option value="personal">{occupancyLabel.personal[loc]}</option>
        </select>
        <select value={city} onChange={(e) => setCity(e.target.value)}>
          <option value="">{locale === 'fr' ? 'Ville' : 'City'}</option>
          {cities.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <select value={usage} onChange={(e) => setUsage(e.target.value as '' | Usage)}>
          <option value="">{locale === 'fr' ? 'Usage' : 'Use'}</option>
          <option value="rental">{usageLabel.rental[loc]}</option>
          <option value="personal">{usageLabel.personal[loc]}</option>
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="name">{locale === 'fr' ? 'Nom' : 'Name'}</option>
          <option value="value">{locale === 'fr' ? 'Valeur' : 'Value'}</option>
          <option value="yield">{locale === 'fr' ? 'Rentabilité' : 'Yield'}</option>
        </select>
        <div className="ws-segment">
          <button type="button" className={view === 'cards' ? 'on' : ''} onClick={() => setView('cards')}>
            {locale === 'fr' ? 'Cartes' : 'Cards'}
          </button>
          <button type="button" className={view === 'table' ? 'on' : ''} onClick={() => setView('table')}>
            {locale === 'fr' ? 'Tableau' : 'Table'}
          </button>
        </div>
      </div>
      {view === 'cards' ? (
        <div className="grid-2">
          {slice.map((p) => (
            <article className="ws-property" key={p.id}>
              <img src={p.photo} alt="" />
              <div className="ws-property-body">
                <div className="ws-actions">
                  <span className={`ws-pill ${p.occupancy}`}>{occupancyLabel[p.occupancy][loc]}</span>
                  {p.alert && <span className="ws-pill expiring">{p.alert}</span>}
                </div>
                <h3>
                  <Link to={`/app/properties/${p.id}`}>{p.name}</Link>
                </h3>
                <p className="muted">{p.address}</p>
                <p>
                  {typeLabel[p.type][loc]} · {p.surface} m² · {money(p.estimatedValue)}
                </p>
                <p>
                  {locale === 'fr' ? 'Revenus' : 'Income'} {money(p.monthlyIncome)} · {locale === 'fr' ? 'Dépenses' : 'Expenses'}{' '}
                  {money(p.monthlyExpenses)} · {pct(yieldOf(p.monthlyIncome, p.estimatedValue))}
                </p>
                <p className="muted">{p.nextDueLabel}</p>
                <div className="ws-actions">
                  <Link className="btn secondary" to={`/app/properties/${p.id}`}>
                    {locale === 'fr' ? 'Consulter' : 'Open'}
                  </Link>
                  <Link className="btn ghost" to={`/app/properties/${p.id}/edit`}>
                    {locale === 'fr' ? 'Modifier' : 'Edit'}
                  </Link>
                  <button className="btn ghost" type="button" onClick={() => setPending(p)}>
                    {locale === 'fr' ? 'Archiver' : 'Archive'}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="card table-scroll" style={{ padding: 0 }}>
          <table>
            <thead>
              <tr>
                <th>{locale === 'fr' ? 'Bien' : 'Property'}</th>
                <th>{locale === 'fr' ? 'Type' : 'Type'}</th>
                <th>{locale === 'fr' ? 'Statut' : 'Status'}</th>
                <th>m²</th>
                <th>{locale === 'fr' ? 'Valeur' : 'Value'}</th>
                <th>{locale === 'fr' ? 'Rentabilité' : 'Yield'}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {slice.map((p) => (
                <tr key={p.id}>
                  <td>
                    <Link to={`/app/properties/${p.id}`}>{p.name}</Link>
                    <div className="muted">{p.city}</div>
                  </td>
                  <td>{typeLabel[p.type][loc]}</td>
                  <td>
                    <span className={`ws-pill ${p.occupancy}`}>{occupancyLabel[p.occupancy][loc]}</span>
                  </td>
                  <td>{p.surface}</td>
                  <td>{money(p.estimatedValue)}</td>
                  <td>{pct(yieldOf(p.monthlyIncome, p.estimatedValue))}</td>
                  <td className="row-actions">
                    <Link to={`/app/properties/${p.id}/edit`}>{locale === 'fr' ? 'Modifier' : 'Edit'}</Link>
                    <button className="btn ghost" type="button" onClick={() => setPending(p)}>
                      {locale === 'fr' ? 'Supprimer' : 'Delete'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="muted" style={{ marginTop: 16 }}>
        {page} / {pages}
        {page > 1 && (
          <button className="btn ghost" type="button" onClick={() => setPage((n) => n - 1)}>
            ←
          </button>
        )}
        {page < pages && (
          <button className="btn ghost" type="button" onClick={() => setPage((n) => n + 1)}>
            →
          </button>
        )}
      </p>
      <ConfirmDialog
        open={Boolean(pending)}
        title={locale === 'fr' ? 'Archiver ce bien ?' : 'Archive this property?'}
        body={pending ? pending.name : ''}
        confirmLabel={locale === 'fr' ? 'Archiver' : 'Archive'}
        onCancel={() => setPending(null)}
        onConfirm={() => {
          if (pending) setItems((list) => list.filter((p) => p.id !== pending.id));
          setPending(null);
        }}
      />
    </>
  );
}
