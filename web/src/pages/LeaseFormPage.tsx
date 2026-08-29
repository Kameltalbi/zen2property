import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api, type Lease, type Property, type Tenant } from '../api';
import { useI18n } from '../i18n';

const emptyForm = {
  propertyId: '',
  tenantId: '',
  label: '',
  status: 'active' as Lease['status'],
  leaseType: 'unfurnished' as Lease['leaseType'],
  startDate: '',
  endDate: '',
  durationMonths: '',
  noticePeriodDays: '30',
  monthlyRent: '',
  monthlyCharges: '0',
  currency: 'EUR',
  deposit: '0',
  paymentDay: '1',
  paymentFrequency: 'monthly' as Lease['paymentFrequency'],
  rentIncreaseFrequency: 'yearly' as Lease['rentIncreaseFrequency'],
  rentIncreaseOtherMonths: '',
  rentIncreaseType: 'percent' as Lease['rentIncreaseType'],
  rentIncreaseValue: '0',
  rentIncreaseIndex: '',
  nextIncreaseDate: '',
  includesUtilities: false,
  petsAllowed: false,
  notes: '',
};

export function LeaseFormPage() {
  const { id } = useParams();
  const editing = Boolean(id);
  const navigate = useNavigate();
  const { t } = useI18n();
  const [properties, setProperties] = useState<Property[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    void Promise.all([
      api<{ properties: Property[] }>('/properties'),
      api<{ tenants: Tenant[] }>('/tenants'),
    ]).then(([p, ten]) => {
      setProperties(p.properties);
      setTenants(ten.tenants);
      setForm((f) => {
        const propertyId = f.propertyId || p.properties[0]?.id || '';
        const forProperty = ten.tenants.filter((x) => x.propertyId === propertyId);
        return {
          ...f,
          propertyId,
          tenantId: f.tenantId || forProperty[0]?.id || '',
          currency: f.currency || p.properties[0]?.currency || 'EUR',
        };
      });
    });

    if (!id) return;
    void api<{ lease: Lease }>(`/leases/${id}`)
      .then(({ lease }) => {
        setForm({
          propertyId: lease.propertyId,
          tenantId: lease.tenantId,
          label: lease.label ?? '',
          status: lease.status,
          leaseType: lease.leaseType,
          startDate: lease.startDate.slice(0, 10),
          endDate: lease.endDate?.slice(0, 10) ?? '',
          durationMonths: lease.durationMonths?.toString() ?? '',
          noticePeriodDays: String(lease.noticePeriodDays),
          monthlyRent: String(lease.monthlyRent),
          monthlyCharges: String(lease.monthlyCharges),
          currency: lease.currency,
          deposit: String(lease.deposit),
          paymentDay: String(lease.paymentDay),
          paymentFrequency: lease.paymentFrequency,
          rentIncreaseFrequency: lease.rentIncreaseFrequency,
          rentIncreaseOtherMonths: lease.rentIncreaseOtherMonths?.toString() ?? '',
          rentIncreaseType: lease.rentIncreaseType,
          rentIncreaseValue: String(lease.rentIncreaseValue),
          rentIncreaseIndex: lease.rentIncreaseIndex ?? '',
          nextIncreaseDate: lease.nextIncreaseDate?.slice(0, 10) ?? '',
          includesUtilities: lease.includesUtilities,
          petsAllowed: lease.petsAllowed,
          notes: lease.notes ?? '',
        });
      })
      .catch((e) => setError(e.message));
  }, [id]);

  const tenantsForProperty = useMemo(
    () => tenants.filter((x) => x.propertyId === form.propertyId),
    [tenants, form.propertyId],
  );

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function onPropertyChange(propertyId: string) {
    const property = properties.find((p) => p.id === propertyId);
    const forProperty = tenants.filter((x) => x.propertyId === propertyId);
    setForm((f) => ({
      ...f,
      propertyId,
      tenantId: forProperty.some((x) => x.id === f.tenantId) ? f.tenantId : forProperty[0]?.id || '',
      currency: property?.currency || f.currency,
      monthlyRent: property?.monthlyRent != null ? String(property.monthlyRent) : f.monthlyRent,
      monthlyCharges: property ? String(property.monthlyCharges) : f.monthlyCharges,
    }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setBusy(true);
    const body = {
      propertyId: form.propertyId,
      tenantId: form.tenantId,
      label: form.label || undefined,
      status: form.status,
      leaseType: form.leaseType,
      startDate: form.startDate,
      endDate: form.endDate || null,
      durationMonths: form.durationMonths ? Number(form.durationMonths) : null,
      noticePeriodDays: Number(form.noticePeriodDays),
      monthlyRent: Number(form.monthlyRent),
      monthlyCharges: Number(form.monthlyCharges),
      currency: form.currency,
      deposit: Number(form.deposit),
      paymentDay: Number(form.paymentDay),
      paymentFrequency: form.paymentFrequency,
      rentIncreaseFrequency: form.rentIncreaseFrequency,
      rentIncreaseOtherMonths:
        form.rentIncreaseFrequency === 'other' && form.rentIncreaseOtherMonths
          ? Number(form.rentIncreaseOtherMonths)
          : null,
      rentIncreaseType: form.rentIncreaseType,
      rentIncreaseValue: Number(form.rentIncreaseValue),
      rentIncreaseIndex: form.rentIncreaseIndex || null,
      nextIncreaseDate: form.nextIncreaseDate || null,
      includesUtilities: form.includesUtilities,
      petsAllowed: form.petsAllowed,
      notes: form.notes || null,
    };

    try {
      if (editing && id) {
        const { propertyId: _p, tenantId: _t, ...patch } = body;
        await api(`/leases/${id}`, { method: 'PATCH', body: JSON.stringify(patch) });
        navigate(`/app/leases/${id}`);
      } else {
        const data = await api<{ lease: Lease }>('/leases', {
          method: 'POST',
          body: JSON.stringify(body),
        });
        navigate(`/app/leases/${data.lease.id}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t.leases.saveFailed);
    } finally {
      setBusy(false);
    }
  }

  if (!editing && (properties.length === 0 || tenants.length === 0)) {
    return (
      <>
        <div className="page-head">
          <h1>{t.leases.add}</h1>
        </div>
        <p className="muted">{t.leases.needBoth}</p>
        <div className="ws-actions">
          {properties.length === 0 && (
            <Link className="btn" to="/app/properties/new">
              {t.app.addProperty}
            </Link>
          )}
          {tenants.length === 0 && (
            <Link className="btn secondary" to="/app/tenants/new">
              {t.app.addTenant}
            </Link>
          )}
        </div>
      </>
    );
  }

  return (
    <>
      <div className="page-head">
        <div>
          <p className="kicker">{t.leases.kicker}</p>
          <h1>{editing ? t.leases.edit : t.leases.add}</h1>
        </div>
      </div>
      <form className="form card lease-form" onSubmit={(e) => void onSubmit(e)}>
        <h3>{t.leases.sectionParties}</h3>
        <div className="grid-2">
          <label>
            {t.leases.property}
            <select
              value={form.propertyId}
              onChange={(e) => onPropertyChange(e.target.value)}
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
          <label>
            {t.leases.tenant}
            <select
              value={form.tenantId}
              onChange={(e) => set('tenantId', e.target.value)}
              disabled={editing}
              required
            >
              {tenantsForProperty.map((tenant) => (
                <option key={tenant.id} value={tenant.id}>
                  {tenant.firstName} {tenant.lastName}
                </option>
              ))}
            </select>
          </label>
        </div>
        {tenantsForProperty.length === 0 && <p className="muted">{t.leases.noTenantForProperty}</p>}

        <label>
          {t.leases.label}
          <input value={form.label} onChange={(e) => set('label', e.target.value)} placeholder={t.leases.labelPh} />
        </label>

        <div className="grid-2">
          <label>
            {t.leases.status}
            <select value={form.status} onChange={(e) => set('status', e.target.value as Lease['status'])}>
              {(Object.keys(t.leases.statusLabels) as Lease['status'][]).map((s) => (
                <option key={s} value={s}>
                  {t.leases.statusLabels[s]}
                </option>
              ))}
            </select>
          </label>
          <label>
            {t.leases.leaseType}
            <select value={form.leaseType} onChange={(e) => set('leaseType', e.target.value as Lease['leaseType'])}>
              {(Object.keys(t.leases.typeLabels) as Lease['leaseType'][]).map((s) => (
                <option key={s} value={s}>
                  {t.leases.typeLabels[s]}
                </option>
              ))}
            </select>
          </label>
        </div>

        <h3>{t.leases.sectionDates}</h3>
        <div className="grid-2">
          <label>
            {t.leases.start}
            <input type="date" value={form.startDate} onChange={(e) => set('startDate', e.target.value)} required />
          </label>
          <label>
            {t.leases.end}
            <input type="date" value={form.endDate} onChange={(e) => set('endDate', e.target.value)} />
          </label>
        </div>
        <div className="grid-2">
          <label>
            {t.leases.durationMonths}
            <input
              type="number"
              min="1"
              value={form.durationMonths}
              onChange={(e) => set('durationMonths', e.target.value)}
            />
          </label>
          <label>
            {t.leases.noticeDays}
            <input
              type="number"
              min="0"
              value={form.noticePeriodDays}
              onChange={(e) => set('noticePeriodDays', e.target.value)}
              required
            />
          </label>
        </div>

        <h3>{t.leases.sectionMoney}</h3>
        <div className="grid-2">
          <label>
            {t.leases.monthlyRent}
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.monthlyRent}
              onChange={(e) => set('monthlyRent', e.target.value)}
              required
            />
          </label>
          <label>
            {t.leases.monthlyCharges}
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.monthlyCharges}
              onChange={(e) => set('monthlyCharges', e.target.value)}
            />
          </label>
        </div>
        <div className="grid-2">
          <label>
            {t.leases.deposit}
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.deposit}
              onChange={(e) => set('deposit', e.target.value)}
            />
          </label>
          <label>
            {t.leases.currency}
            <input
              value={form.currency}
              maxLength={3}
              onChange={(e) => set('currency', e.target.value.toUpperCase())}
              required
            />
          </label>
        </div>
        <div className="grid-2">
          <label>
            {t.leases.paymentDay}
            <input
              type="number"
              min="1"
              max="31"
              value={form.paymentDay}
              onChange={(e) => set('paymentDay', e.target.value)}
              required
            />
          </label>
          <label>
            {t.leases.paymentFrequency}
            <select
              value={form.paymentFrequency}
              onChange={(e) => set('paymentFrequency', e.target.value as Lease['paymentFrequency'])}
            >
              <option value="monthly">{t.leases.freqMonthly}</option>
              <option value="quarterly">{t.leases.freqQuarterly}</option>
            </select>
          </label>
        </div>

        <h3>{t.leases.sectionIncrease}</h3>
        <p className="muted">{t.leases.increaseLede}</p>
        <label>
          {t.leases.increaseFrequency}
          <select
            value={form.rentIncreaseFrequency}
            onChange={(e) => set('rentIncreaseFrequency', e.target.value as Lease['rentIncreaseFrequency'])}
          >
            <option value="yearly">{t.leases.increaseYearly}</option>
            <option value="every_2_years">{t.leases.increase2y}</option>
            <option value="every_3_years">{t.leases.increase3y}</option>
            <option value="other">{t.leases.increaseOther}</option>
            <option value="none">{t.leases.increaseNone}</option>
          </select>
        </label>
        {form.rentIncreaseFrequency === 'other' && (
          <label>
            {t.leases.otherMonths}
            <input
              type="number"
              min="1"
              value={form.rentIncreaseOtherMonths}
              onChange={(e) => set('rentIncreaseOtherMonths', e.target.value)}
              required
            />
          </label>
        )}
        {form.rentIncreaseFrequency !== 'none' && (
          <>
            <div className="grid-2">
              <label>
                {t.leases.increaseType}
                <select
                  value={form.rentIncreaseType}
                  onChange={(e) => set('rentIncreaseType', e.target.value as Lease['rentIncreaseType'])}
                >
                  <option value="percent">{t.leases.increasePercent}</option>
                  <option value="fixed">{t.leases.increaseFixed}</option>
                  <option value="index">{t.leases.increaseIndex}</option>
                </select>
              </label>
              <label>
                {t.leases.increaseValue}
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.rentIncreaseValue}
                  onChange={(e) => set('rentIncreaseValue', e.target.value)}
                />
              </label>
            </div>
            {form.rentIncreaseType === 'index' && (
              <label>
                {t.leases.indexName}
                <input
                  value={form.rentIncreaseIndex}
                  onChange={(e) => set('rentIncreaseIndex', e.target.value)}
                  placeholder="IRL / IPC…"
                />
              </label>
            )}
            <label>
              {t.leases.nextIncrease}
              <input
                type="date"
                value={form.nextIncreaseDate}
                onChange={(e) => set('nextIncreaseDate', e.target.value)}
              />
            </label>
          </>
        )}

        <h3>{t.leases.sectionExtras}</h3>
        <label className="check-row">
          <input
            type="checkbox"
            checked={form.includesUtilities}
            onChange={(e) => set('includesUtilities', e.target.checked)}
          />
          {t.leases.includesUtilities}
        </label>
        <label className="check-row">
          <input type="checkbox" checked={form.petsAllowed} onChange={(e) => set('petsAllowed', e.target.checked)} />
          {t.leases.petsAllowed}
        </label>
        <label>
          {t.leases.notes}
          <textarea value={form.notes} onChange={(e) => set('notes', e.target.value)} rows={4} />
        </label>

        {error && <p className="error">{error}</p>}
        <button className="btn" type="submit" disabled={busy || tenantsForProperty.length === 0}>
          {busy ? t.leases.saving : t.leases.save}
        </button>
      </form>
    </>
  );
}
