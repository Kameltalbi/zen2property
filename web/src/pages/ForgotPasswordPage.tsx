import { useState, type FormEvent } from 'react';
import { api } from '../api';
import { useI18n } from '../i18n';

export function ForgotPasswordPage() {
  const { t } = useI18n();
  const [email, setEmail] = useState('');
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    try {
      const data = await api<{ ok: true; resetUrl?: string }>('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      setNotice(data.resetUrl ? `${t.auth.resetDev} ${data.resetUrl}` : t.auth.resetSent);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.auth.resetFailed);
    }
  }

  return (
    <section className="narrow section">
      <h1>{t.auth.resetTitle}</h1>
      <form className="form" onSubmit={(e) => void onSubmit(e)} style={{ marginTop: 20 }}>
        <label>
          {t.auth.email}
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        {error && <p className="error">{error}</p>}
        {notice && <p className="ok">{notice}</p>}
        <button className="btn" type="submit">
          {t.auth.sendReset}
        </button>
      </form>
    </section>
  );
}
