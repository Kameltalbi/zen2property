import { useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../api';
import { useI18n } from '../i18n';

export function ResetPasswordPage() {
  const { t } = useI18n();
  const [params] = useSearchParams();
  const [password, setPassword] = useState('');
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const token = params.get('token') ?? '';

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    try {
      await api('/auth/reset-password', { method: 'POST', body: JSON.stringify({ token, password }) });
      setNotice(t.auth.passwordUpdated);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.auth.resetFailed);
    }
  }

  return (
    <section className="narrow section">
      <h1>{t.auth.newPasswordTitle}</h1>
      <form className="form" onSubmit={(e) => void onSubmit(e)} style={{ marginTop: 20 }}>
        <label>
          {t.auth.newPassword}
          <input type="password" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        {error && <p className="error">{error}</p>}
        {notice && (
          <p className="ok">
            {notice} <Link to="/login">{t.nav.login}</Link>
          </p>
        )}
        <button className="btn" type="submit" disabled={!token}>
          {t.auth.updatePassword}
        </button>
      </form>
    </section>
  );
}
