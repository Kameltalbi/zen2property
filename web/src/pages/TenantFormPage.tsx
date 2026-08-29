import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api, type Property, type Tenant } from '../api';
import { useI18n } from '../i18n';

export function TenantFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useI18n();
  const editing = Boolean(id);
  const [properties, setProperties] = useState<Property[]>([]);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    propertyId: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    moveInDate: '',
    deposit: '0',
  });

  useEffect(() => {
    void api<{ properties: Property[] }>('/properties').then((d) => {
      setProperties(d.properties);
      setForm((f) => ({ ...f, propertyId: f.propertyId || d.properties[0]?.id || '' }));
    });
    if (!id) return;
    void api<{ tenant: Tenant }>(`/tenants/${id}`)
      .then(({ tenant }) => {
        setForm({
          propertyId: tenant.propertyId,
          firstName: tenant.firstName,
          lastName: tenant.lastName,
          email: tenant.email ?? '',
          phone: tenant.phone ?? '',
          moveInDate: tenant.moveInDate.slice(0, 10),
          deposit: tenant.deposit.toString(),
        });
      })
      .catch((e) => setError(e.message));
  }, [id]);

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const body = {
      propertyId: form.propertyId,
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email || undefined,
      phone: form.phone || undefined,
      moveInDate: form.moveInDate,
      deposit: Number(form.deposit),
    };
    try {
      if (editing && id) {
        await api(`/tenants/${id}`, {
          method: 'PATCH',
          body: JSON.stringify({
            firstName: form.firstName,
            lastName: form.lastName,
            email: form.email || undefined,
            phone: form.phone || undefined,
            moveInDate: form.moveInDate,
            deposit: Number(form.deposit),
          }),
        });
        navigate(`/app/tenants/${id}`);
      } else {
        await api('/tenants', { method: 'POST', body: JSON.stringify(body) });
        navigate('/app/tenants');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t.tenants.saveFailed);
    }
  }

  if (!editing && properties.length === 0) {
    return (
      <>
        <div className="page-head">
          <h1>{t.tenants.add}</h1>
        </div>
        <p className="muted">{t.tenants.needProperty}</p>
        <Link className="btn" to="/app/properties/new">
          {t.app.addProperty}
        </Link>
      </>
    );
  }

  return (
    <>
      <div className="page-head">
        <h1>{editing ? t.tenants.edit : t.tenants.add}</h1>
      </div>
      <form className="form card" onSubmit={(e) => void onSubmit(e)}>
        <label>
          {t.tenants.property}
          <select
            value={form.propertyId}
            onChange={(e) => set('propertyId', e.target.value)}
            disabled={editing}
            required
          >
            {properties.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
        <div className="grid-2">
          <label>
            {t.tenants.firstName}
            <input value={form.firstName} onChange={(e) => set('firstName', e.target.value)} required />
          </label>
          <label>
            {t.tenants.lastName}
            <input value={form.lastName} onChange={(e) => set('lastName', e.target.value)} required />
          </label>
        </div>
        <div className="grid-2">
          <label>
            {t.tenants.email}
            <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} />
          </label>
          <label>
            {t.tenants.phone}
            <input value={form.phone} onChange={(e) => set('phone', e.target.value)} />
          </label>
        </div>
        <div className="grid-2">
          <label>
            {t.tenants.moveIn}
            <input type="date" value={form.moveInDate} onChange={(e) => set('moveInDate', e.target.value)} required />
          </label>
          <label>
            {t.tenants.deposit}
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.deposit}
              onChange={(e) => set('deposit', e.target.value)}
            />
          </label>
        </div>
        {error && <p className="error">{error}</p>}
        <button className="btn" type="submit">
          {t.tenants.save}
        </button>
      </form>
    </>
  );
}
