import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, type Payment, type Property, type Tenant } from '../api';

export function TenantDetailPage() {
  const { id } = useParams();
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [property, setProperty] = useState<Property | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    void (async () => {
      try {
        const { tenant: t } = await api<{ tenant: Tenant }>(`/tenants/${id}`);
        const [{ property: p }, pays] = await Promise.all([
          api<{ property: Property }>(`/properties/${t.propertyId}`),
          api<{ payments: Payment[] }>(`/payments?tenantId=${t.id}`),
        ]);
        setTenant(t);
        setProperty(p);
        setPayments(pays.payments);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Load failed');
      }
    })();
  }, [id]);

  if (error) return <p className="error">{error}</p>;
  if (!tenant) return <p className="muted">Loading tenant…</p>;

  return (
    <>
      <div className="page-head">
        <div>
          <p className="kicker">{property?.name}</p>
          <h1>
            {tenant.firstName} {tenant.lastName}
          </h1>
          <p className="muted">
            {tenant.email ?? 'No email'} · deposit {tenant.deposit}
          </p>
        </div>
        <Link className="btn secondary" to={`/app/tenants/${tenant.id}/edit`}>
          Edit
        </Link>
      </div>
      <div className="card table-scroll" style={{ padding: 0 }}>
        <table>
          <thead>
            <tr>
              <th>Period</th>
              <th>Due</th>
              <th>Amount</th>
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
        {payments.length === 0 && <p className="muted" style={{ padding: 16 }}>No payments yet.</p>}
      </div>
    </>
  );
}
