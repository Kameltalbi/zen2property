import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, type Payment, type Property, type Tenant } from '../api';
import { useI18n } from '../i18n';

export function TenantDetailPage() {
  const { id } = useParams();
  const { t, locale } = useI18n();
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [property, setProperty] = useState<Property | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    void (async () => {
      try {
        const { tenant: next } = await api<{ tenant: Tenant }>(`/tenants/${id}`);
        const [{ property: prop }, pays] = await Promise.all([
          api<{ property: Property }>(`/properties/${next.propertyId}`),
          api<{ payments: Payment[] }>(`/payments?tenantId=${next.id}`),
        ]);
        setTenant(next);
        setProperty(prop);
        setPayments(pays.payments);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Load failed');
      }
    })();
  }, [id]);

  if (error) return <p className="error">{error}</p>;
  if (!tenant) return <p className="muted">{locale === 'fr' ? 'Chargement…' : 'Loading…'}</p>;

  return (
    <>
      <div className="page-head">
        <div>
          <p className="kicker">{property?.name}</p>
          <h1>
            {tenant.firstName} {tenant.lastName}
          </h1>
          <p className="muted">
            {tenant.email ?? t.tenants.noEmail} · {t.tenants.deposit} {tenant.deposit}
          </p>
        </div>
        <Link className="btn secondary" to={`/app/tenants/${tenant.id}/edit`}>
          {t.tenants.editLink}
        </Link>
      </div>
      <div className="card table-scroll" style={{ padding: 0 }}>
        <table>
          <thead>
            <tr>
              <th>{locale === 'fr' ? 'Période' : 'Period'}</th>
              <th>{locale === 'fr' ? 'Échéance' : 'Due'}</th>
              <th>{locale === 'fr' ? 'Montant' : 'Amount'}</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p.id}>
                <td>
                  {p.periodStart.slice(0, 10)} → {p.periodEnd.slice(0, 10)}
                </td>
                <td>{p.dueDate.slice(0, 10)}</td>
                <td>
                  {p.amount} {p.currency}
                </td>
                <td>
                  <span className={`pill ${p.status}`}>{p.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {payments.length === 0 && (
          <p className="muted" style={{ padding: 16 }}>
            {locale === 'fr' ? 'Aucun paiement pour l’instant.' : 'No payments yet.'}
          </p>
        )}
      </div>
    </>
  );
}
