import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth';
import { useI18n } from '../i18n';

export function LoginPage() {
  const { login } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('/app');
    } catch (err) {
      setError(err instanceof Error ? err.message : t.auth.failed);
    }
  }

  return (
    <section className="narrow section">
      <h1>{t.auth.loginTitle}</h1>
      <form className="form" onSubmit={(e) => void onSubmit(e)} style={{ marginTop: 20 }}>
        <label>
          {t.auth.email}
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label>
          {t.auth.password}
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        {error && <p className="error">{error}</p>}
        <button className="btn" type="submit">
          {t.auth.continue}
        </button>
      </form>
      <p className="muted">
        <Link to="/forgot-password">{t.auth.forgot}</Link> · {t.auth.newHere} <Link to="/signup">{t.auth.createAccount}</Link>
      </p>
    </section>
  );
}
