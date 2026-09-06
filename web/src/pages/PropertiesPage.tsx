import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, type Property, type Tenant } from '../api';
import { useI18n } from '../i18n';
import { money, occupancyLabel, propertyTypeLabel } from '../workspace/format';
import { ConfirmDialog, EmptyState, ErrorState, LoadingState, PageHeader } from '../workspace/ui';

const API_TYPES = ['APARTMENT', 'HOUSE', 'STUDIO', 'OTHER'] as const;

export function PropertiesPage() {
  const { t, locale } = useI18n();
  const loc = locale;
  const [view, setView] = useState<'cards' | 'table'>('cards');
  const [q, setQ] = useState('');
  const [type, setType] = useState('');
  const [city, setCity] = useState('');
  const [sort, setSort] = useState('name');
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<Property[] | null>(null);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<Property | null>(null);
  const [deleteError, setDeleteError] = useState('');

  async function load() {
    try {
      setError(null);
      const [p, ten] = await Promise.all([
        api<{ properties: Property[] }>('/properties'),
        api<{ tenants: Tenant[] }>('/tenants'),
      ]);
      setItems(p.properties);
      setTenants(ten.tenants);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load properties');
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const occupiedIds = useMemo(() => {
    const ids = new Set<string>();
    for (const tenant of tenants) {
      if (!tenant.moveOutDate) ids.add(tenant.propertyId);
    }
    return ids;
  }, [tenants]);

  const filtered = useMemo(() => {
    if (!items) return [];
    let list = items;
    if (q) {
      const n = q.toLowerCase();
      list = list.filter((p) => `${p.name} ${p.address} ${p.city ?? ''}`.toLowerCase().includes(n));
    }
    if (type) list = list.filter((p) => p.type === type);
    if (city) list = list.filter((p) => p.city === city);
    list = [...list].sort((a, b) => {
      if (sort === 'rent') return (b.monthlyRent ?? 0) - (a.monthlyRent ?? 0);
      if (sort === 'city') return (a.city ?? '').localeCompare(b.city ?? '');
      return a.name.localeCompare(b.name);
    });
    return list;
  }, [items, q, type, city, sort]);

  const pageSize = 6;
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const slice = filtered.slice((page - 1) * pageSize, page * pageSize);
  const cities = [...new Set((items ?? []).map((p) => p.city).filter((c): c is string => Boolean(c)))];

  async function confirmDelete() {
    if (!pending) return;
    setDeleteError('');
    try {
      await api(`/properties/${pending.id}`, { method: 'DELETE' });
      setPending(null);
      await load();
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Unable to delete property');
    }
  }

  if (error) return <ErrorState message={error} onRetry={() => void load()} />;
  if (!items) return <LoadingState label={t.pages.loading} />;

  if (!items.length) {
    return (
      <EmptyState
        title={t.pages.noProperties}
        body={t.pages.noPropertiesBody}
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
        <input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setPage(1);
          }}
          placeholder={locale === 'fr' ? 'Rechercher' : 'Search'}
        />
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="">{locale === 'fr' ? 'Type' : 'Type'}</option>
          {API_TYPES.map((value) => (
            <option key={value} value={value}>
              {propertyTypeLabel(value, loc)}
            </option>
          ))}
        </select>
        <select value={city} onChange={(e) => setCity(e.target.value)}>
          <option value="">{locale === 'fr' ? 'Ville' : 'City'}</option>
          {cities.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="name">{locale === 'fr' ? 'Nom' : 'Name'}</option>
          <option value="city">{locale === 'fr' ? 'Ville' : 'City'}</option>
          <option value="rent">{locale === 'fr' ? 'Loyer' : 'Rent'}</option>
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
          {slice.map((p) => {
            const occupied = occupiedIds.has(p.id);
            return (
              <article className="ws-property" key={p.id}>
                <div className="ws-property-body">
                  <div className="ws-actions">
                    <span className={`ws-pill ${occupied ? 'rented' : 'vacant'}`}>
                      {occupancyLabel[occupied ? 'rented' : 'vacant'][loc]}
                    </span>
                  </div>
                  <h3>
                    <Link to={`/app/properties/${p.id}`}>{p.name}</Link>
                  </h3>
                  <p className="muted">
                    {p.address}
                    {p.city ? ` · ${p.city}` : ''}
                  </p>
                  <p>
                    {propertyTypeLabel(p.type, loc)}
                    {p.surface != null ? ` · ${p.surface} m²` : ''}
                  </p>
                  {p.monthlyRent != null && (
                    <p>
                      {money(p.monthlyRent, p.currency, loc)}
                      {p.monthlyCharges ? ` + ${money(p.monthlyCharges, p.currency, loc)}` : ''}
                    </p>
                  )}
                  <div className="ws-actions">
                    <Link className="btn secondary" to={`/app/properties/${p.id}`}>
                      {locale === 'fr' ? 'Consulter' : 'Open'}
                    </Link>
                    <Link className="btn ghost" to={`/app/properties/${p.id}/edit`}>
                      {locale === 'fr' ? 'Modifier' : 'Edit'}
                    </Link>
                    <button className="btn ghost" type="button" onClick={() => { setDeleteError(''); setPending(p); }}>
                      {locale === 'fr' ? 'Supprimer' : 'Delete'}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
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
                <th>{locale === 'fr' ? 'Loyer' : 'Rent'}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {slice.map((p) => {
                const occupied = occupiedIds.has(p.id);
                return (
                  <tr key={p.id}>
                    <td>
                      <Link to={`/app/properties/${p.id}`}>{p.name}</Link>
                      <div className="muted">{p.city ?? p.address}</div>
                    </td>
                    <td>{propertyTypeLabel(p.type, loc)}</td>
                    <td>
                      <span className={`ws-pill ${occupied ? 'rented' : 'vacant'}`}>
                        {occupancyLabel[occupied ? 'rented' : 'vacant'][loc]}
                      </span>
                    </td>
                    <td>{p.surface ?? '—'}</td>
                    <td>{p.monthlyRent != null ? money(p.monthlyRent, p.currency, loc) : '—'}</td>
                    <td className="row-actions">
                      <Link to={`/app/properties/${p.id}/edit`}>{locale === 'fr' ? 'Modifier' : 'Edit'}</Link>
                      <button className="btn ghost" type="button" onClick={() => { setDeleteError(''); setPending(p); }}>
                        {locale === 'fr' ? 'Supprimer' : 'Delete'}
                      </button>
                    </td>
                  </tr>
                );
              })}
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
        title={locale === 'fr' ? 'Supprimer ce bien ?' : 'Delete this property?'}
        body={pending ? pending.name : ''}
        confirmLabel={locale === 'fr' ? 'Supprimer' : 'Delete'}
        onCancel={() => {
          setPending(null);
          setDeleteError('');
        }}
        onConfirm={() => {
          void confirmDelete();
        }}
      />
      {deleteError && <p className="error">{deleteError}</p>}
    </>
  );
}
