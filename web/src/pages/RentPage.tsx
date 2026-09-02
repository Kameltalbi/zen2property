import { useEffect, useState, type FormEvent } from 'react';
import { api, downloadPdf, type Payment, type Property, type Tenant } from '../api';
import { useI18n } from '../i18n';

function monthRange(isoDay = new Date().toISOString().slice(0, 10)) {
  const [y, m] = isoDay.split('-').map(Number);
  const start = `${y}-${String(m).padStart(2, '0')}-01`;
  const endDate = new Date(y, m, 0).getDate();
  const end = `${y}-${String(m).padStart(2, '0')}-${String(endDate).padStart(2, '0')}`;
  return { start, end };
}

export function RentPage() {
  const { locale } = useI18n();
  const fr = locale === 'fr';
  const { start, end } = monthRange();
  const [properties, setProperties] = useState<Property[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [form, setForm] = useState({
    propertyId: '',
    tenantId: '',
    amount: '',
    rentAmount: '',
    chargesAmount: '0',
    periodStart: start,
    periodEnd: end,
    dueDate: start,
  });

  async function reload() {
    const [p, t, pay] = await Promise.all([
      api<{ properties: Property[] }>('/properties'),
      api<{ tenants: Tenant[] }>('/tenants'),
      api<{ payments: Payment[] }>('/payments'),
    ]);
    setProperties(p.properties);
    setTenants(t.tenants);
    setPayments(pay.payments);
    setForm((f) => ({ ...f, propertyId: f.propertyId || p.properties[0]?.id || '' }));
  }

  useEffect(() => {
    void reload().catch((e) => setError(e.message));
  }, []);

  const tenantsForProperty = tenants.filter((t) => t.propertyId === form.propertyId);

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    setError('');
    try {
      await api('/payments', {
        method: 'POST',
        body: JSON.stringify({
          propertyId: form.propertyId,
          tenantId: form.tenantId || undefined,
          amount: Number(form.amount),
          rentAmount: form.rentAmount ? Number(form.rentAmount) : undefined,
          chargesAmount: Number(form.chargesAmount),
          periodStart: form.periodStart,
          periodEnd: form.periodEnd,
          dueDate: form.dueDate,
          status: 'PENDING',
        }),
      });
      setNotice('Payment logged.');
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not log payment');
    }
  }

  async function markPaid(id: string) {
    setError('');
    await api(`/payments/${id}/mark-paid`, { method: 'POST', body: JSON.stringify({}) });
    await reload();
  }

  async function emailReceipt(id: string) {
    setError('');
    setNotice('');
    try {
      const { receipt } = await api<{ receipt: { id: string; number: string } }>(`/payments/${id}/receipt`, {
        method: 'POST',
      });
      const sent = await api<{ to: string; number: string }>(`/receipts/${receipt.id}/email`, {
        method: 'POST',
        body: JSON.stringify({}),
      });
      setNotice(
        fr
          ? `Quittance ${sent.number} envoyée à ${sent.to}.`
          : `Receipt ${sent.number} sent to ${sent.to}.`,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : fr ? 'Envoi impossible' : 'Could not send receipt');
    }
  }

  async function issueReceipt(id: string) {
    setError('');
    setNotice('');
    try {
      const { receipt } = await api<{ receipt: { id: string; number: string } }>(`/payments/${id}/receipt`, {
        method: 'POST',
      });
      await downloadPdf(`/receipts/${receipt.id}/pdf`, `receipt-${receipt.number}.pdf`);
      setNotice(`Receipt ${receipt.number} downloaded.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Receipt failed');
    }
  }

  return (
    <>
      <div className="page-head">
        <div>
          <p className="kicker">Cashflow</p>
          <h1>Rent & receipts</h1>
        </div>
      </div>
      {error && <p className="error">{error}</p>}
      {notice && <p className="ok">{notice}</p>}

      <form className="card form" onSubmit={(e) => void onCreate(e)} style={{ marginBottom: 20 }}>
        <h3>Log a payment</h3>
        <div className="grid-2">
          <label>
            Property
            <select value={form.propertyId} onChange={(e) => setForm((f) => ({ ...f, propertyId: e.target.value, tenantId: '' }))}>
              {properties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Tenant
            <select value={form.tenantId} onChange={(e) => setForm((f) => ({ ...f, tenantId: e.target.value }))}>
              <option value="">—</option>
              {tenantsForProperty.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.firstName} {t.lastName}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="grid-2">
          <label>
            Amount
            <input type="number" min="0" step="0.01" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} required />
          </label>
          <label>
            Charges
            <input type="number" min="0" step="0.01" value={form.chargesAmount} onChange={(e) => setForm((f) => ({ ...f, chargesAmount: e.target.value }))} />
          </label>
        </div>
        <div className="grid-2">
          <label>
            Period start
            <input type="date" value={form.periodStart} onChange={(e) => setForm((f) => ({ ...f, periodStart: e.target.value }))} />
          </label>
          <label>
            Period end
            <input type="date" value={form.periodEnd} onChange={(e) => setForm((f) => ({ ...f, periodEnd: e.target.value }))} />
          </label>
        </div>
        <label>
          Due date
          <input type="date" value={form.dueDate} onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))} />
        </label>
        <button className="btn" type="submit">
          Save payment
        </button>
      </form>

      <div className="card table-scroll" style={{ padding: 0 }}>
        <table>
          <thead>
            <tr>
              <th>Due</th>
              <th>Property</th>
              <th>Amount</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p.id}>
                <td>{p.dueDate.slice(0, 10)}</td>
                <td>{properties.find((x) => x.id === p.propertyId)?.name}</td>
                <td>
                  {p.amount} {p.currency}
                </td>
                <td>
                  <span className={`pill ${p.status}`}>{p.status}</span>
                </td>
                <td className="row-actions">
                  {p.status !== 'PAID' && (
                    <button className="btn secondary" type="button" onClick={() => void markPaid(p.id)}>
                      Mark paid
                    </button>
                  )}
                  {p.status === 'PAID' && (
                    <>
                      <button className="btn" type="button" onClick={() => void issueReceipt(p.id)}>
                        PDF receipt
                      </button>
                      <button className="btn secondary" type="button" onClick={() => void emailReceipt(p.id)}>
                        {fr ? 'Envoyer' : 'Email'}
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
