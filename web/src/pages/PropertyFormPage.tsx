import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api, type Property } from '../api';
import { ISO_COUNTRIES } from '../../../src/data/isoCountries';
import { useI18n } from '../i18n';
import { countryLabel, useCountries } from '../lib/countries';

export function PropertyFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { locale } = useI18n();
  const countries = useCountries();
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    address: '',
    city: '',
    postalCode: '',
    countryCode: 'GB',
    type: 'APARTMENT',
    monthlyRent: '',
    monthlyCharges: '0',
    currency: 'GBP',
    surface: '',
  });

  useEffect(() => {
    if (!id) return;
    void api<{ property: Property }>(`/properties/${id}`)
      .then(({ property }) => {
        setForm({
          name: property.name,
          address: property.address,
          city: property.city ?? '',
          postalCode: property.postalCode ?? '',
          countryCode: property.countryCode,
          type: property.type,
          monthlyRent: property.monthlyRent?.toString() ?? '',
          monthlyCharges: property.monthlyCharges.toString(),
          currency: property.currency,
          surface: property.surface?.toString() ?? '',
        });
      })
      .catch((e) => setError(e.message));
  }, [id]);

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    const body = {
      name: form.name,
      address: form.address,
      city: form.city || undefined,
      postalCode: form.postalCode || undefined,
      countryCode: form.countryCode,
      type: form.type,
      monthlyRent: form.monthlyRent ? Number(form.monthlyRent) : undefined,
      monthlyCharges: Number(form.monthlyCharges),
      currency: form.currency,
      surface: form.surface ? Number(form.surface) : undefined,
    };
    try {
      if (id) {
        await api(`/properties/${id}`, { method: 'PATCH', body: JSON.stringify(body) });
      } else {
        await api('/properties', { method: 'POST', body: JSON.stringify(body) });
      }
      navigate('/app/properties');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    }
  }

  return (
    <>
      <div className="page-head">
        <h1>{id ? 'Edit property' : 'Add property'}</h1>
      </div>
      <form className="form card" onSubmit={(e) => void onSubmit(e)}>
        <label>
          Name
          <input value={form.name} onChange={(e) => set('name', e.target.value)} required />
        </label>
        <label>
          Address
          <input value={form.address} onChange={(e) => set('address', e.target.value)} required />
        </label>
        <div className="grid-2">
          <label>
            City
            <input value={form.city} onChange={(e) => set('city', e.target.value)} />
          </label>
          <label>
            Postal code
            <input value={form.postalCode} onChange={(e) => set('postalCode', e.target.value)} />
          </label>
        </div>
        <div className="grid-2">
          <label>
            Country
            <select
              value={form.countryCode}
              onChange={(e) => {
                const code = e.target.value;
                const match = ISO_COUNTRIES.find((c) => c.code === code);
                setForm((f) => ({ ...f, countryCode: code, currency: match?.currency ?? f.currency }));
              }}
            >
              {countries.map((c) => (
                <option key={c.code} value={c.code}>
                  {countryLabel(c.code, locale)}
                </option>
              ))}
            </select>
          </label>
          <label>
            Type
            <select value={form.type} onChange={(e) => set('type', e.target.value)}>
              <option>APARTMENT</option>
              <option>HOUSE</option>
              <option>STUDIO</option>
              <option>OTHER</option>
            </select>
          </label>
        </div>
        <div className="grid-2">
          <label>
            Monthly rent
            <input type="number" min="0" step="0.01" value={form.monthlyRent} onChange={(e) => set('monthlyRent', e.target.value)} />
          </label>
          <label>
            Monthly charges
            <input type="number" min="0" step="0.01" value={form.monthlyCharges} onChange={(e) => set('monthlyCharges', e.target.value)} />
          </label>
        </div>
        <div className="grid-2">
          <label>
            Currency
            <input value={form.currency} onChange={(e) => set('currency', e.target.value)} maxLength={3} />
          </label>
          <label>
            Surface
            <input type="number" min="0" step="0.01" value={form.surface} onChange={(e) => set('surface', e.target.value)} />
          </label>
        </div>
        {error && <p className="error">{error}</p>}
        <button className="btn" type="submit">
          Save property
        </button>
      </form>
    </>
  );
}
