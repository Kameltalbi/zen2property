import { useEffect, useState, type FormEvent } from 'react';
import { api } from '../api';
import { useAuth } from '../auth';
import { useI18n } from '../i18n';
import { countryLabel, useCountries } from '../lib/countries';

type LegalProfile = {
  country_code: string;
  version: number;
  rules: { receipt: { title: string; requiredFields: string[]; splitRentAndCharges: boolean; legalNotice: string } };
};

export function SettingsPage() {
  const { user, refresh } = useAuth();
  const { locale } = useI18n();
  const countries = useCountries();
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [profile, setProfile] = useState<LegalProfile | null>(null);
  const [question, setQuestion] = useState('What fields must a rent receipt include for this country?');
  const [form, setForm] = useState({
    fullName: user?.fullName ?? '',
    address: user?.address ?? '',
    bankDetails: user?.bankDetails ?? '',
    receiptSignature: user?.receiptSignature ?? '',
    countryCode: user?.countryCode ?? 'GB',
    defaultCurrency: user?.defaultCurrency ?? 'GBP',
  });

  useEffect(() => {
    if (user) {
      setForm({
        fullName: user.fullName,
        address: user.address ?? '',
        bankDetails: user.bankDetails ?? '',
        receiptSignature: user.receiptSignature ?? '',
        countryCode: user.countryCode,
        defaultCurrency: user.defaultCurrency,
      });
    }
  }, [user]);

  useEffect(() => {
    void api<{ profile: LegalProfile }>(`/legal/countries/${form.countryCode}`)
      .then((d) => setProfile(d.profile))
      .catch(() => setProfile(null));
  }, [form.countryCode]);

  async function save(e: FormEvent) {
    e.preventDefault();
    setError('');
    try {
      await api('/me', { method: 'PATCH', body: JSON.stringify(form) });
      await refresh();
      setNotice('Profile saved. New receipts will use this address and signature.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    }
  }

  async function propose(e: FormEvent) {
    e.preventDefault();
    setError('');
    setNotice('');
    try {
      const data = await api<{ draft: { id: string; rationale: string } }>('/legal/ai/propose', {
        method: 'POST',
        body: JSON.stringify({ countryCode: form.countryCode, question }),
      });
      setNotice(`Draft ${data.draft.id} queued for review. ${data.draft.rationale}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'AI request failed');
    }
  }

  return (
    <>
      <div className="page-head">
        <div>
          <p className="kicker">Account</p>
          <h1>Settings & legal</h1>
        </div>
      </div>
      {error && <p className="error">{error}</p>}
      {notice && <p className="ok">{notice}</p>}

      <form className="card form" onSubmit={(e) => void save(e)}>
        <h3>Landlord profile</h3>
        <label>
          Name
          <input value={form.fullName} onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))} />
        </label>
        <label>
          Address (printed on receipts)
          <textarea value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} />
        </label>
        <label>
          Bank details
          <textarea value={form.bankDetails} onChange={(e) => setForm((f) => ({ ...f, bankDetails: e.target.value }))} />
        </label>
        <label>
          Signature line
          <input value={form.receiptSignature} onChange={(e) => setForm((f) => ({ ...f, receiptSignature: e.target.value }))} />
        </label>
        <div className="grid-2">
          <label>
            Country
            <select value={form.countryCode} onChange={(e) => setForm((f) => ({ ...f, countryCode: e.target.value }))}>
              {countries.map((c) => (
                <option key={c.code} value={c.code}>
                  {countryLabel(c.code, locale)}
                </option>
              ))}
            </select>
          </label>
          <label>
            Default currency
            <input value={form.defaultCurrency} maxLength={3} onChange={(e) => setForm((f) => ({ ...f, defaultCurrency: e.target.value }))} />
          </label>
        </div>
        <p className="muted">Plan: {user?.plan}. Change it on the pricing page.</p>
        <button className="btn" type="submit">
          Save
        </button>
      </form>

      {profile && (
        <div className="card" style={{ marginTop: 16 }}>
          <h3>
            Active legal profile · {profile.country_code} v{profile.version}
          </h3>
          <p>
            Receipt title: <strong>{profile.rules.receipt.title}</strong>
          </p>
          <p className="muted">Required fields: {profile.rules.receipt.requiredFields.join(', ')}</p>
          <p className="muted">{profile.rules.receipt.legalNotice}</p>
        </div>
      )}

      <form className="card form" style={{ marginTop: 16 }} onSubmit={(e) => void propose(e)}>
        <h3>AI legal drafts</h3>
        <p className="muted">
          The model proposes a JSON patch. It never writes a receipt and never publishes rules until you apply a draft
          from the API.
        </p>
        <label>
          Question
          <textarea value={question} onChange={(e) => setQuestion(e.target.value)} />
        </label>
        <button className="btn clay" type="submit">
          Propose rule update
        </button>
      </form>
    </>
  );
}
