import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { BrandLogo } from '../BrandLogo';
import { PasswordField } from '../PasswordField';
import { homePath } from '../api';
import { useAuth } from '../auth';
import { useI18n } from '../i18n';
import { LangToggle } from '../layouts';
import { safeNextPath } from '../lib/paths';

export function LoginPage() {
  const { login } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    try {
      const user = await login(email, password);
      navigate(safeNextPath(params.get('next')) ?? homePath(user));
    } catch (err) {
      setError(err instanceof Error ? err.message : t.auth.failed);
    }
  }

  return (
    <section className="auth-split auth-split-page">
      <div className="auth-split-form">
        <div className="auth-page-top">
          <Link className="auth-home-link" to="/">
            {t.auth.backHome}
          </Link>
          <LangToggle />
        </div>
        <Link className="auth-page-brand" to="/" aria-label="Rentelyo">
          <BrandLogo />
        </Link>
        <h1>{t.auth.loginTitle}</h1>
        <form className="form" onSubmit={(e) => void onSubmit(e)}>
          <label>
            {t.auth.email}
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </label>
          <PasswordField
            label={t.auth.password}
            value={password}
            onChange={setPassword}
            show={showPassword}
            onToggleShow={() => setShowPassword((v) => !v)}
            showLabel={t.auth.showPassword}
            hideLabel={t.auth.hidePassword}
            autoComplete="current-password"
            minLength={1}
          />
          <Link className="auth-forgot" to="/forgot-password">
            {t.auth.forgot}
          </Link>
          {error && <p className="error">{error}</p>}
          <button className="btn" type="submit">
            {t.auth.continue}
          </button>
        </form>
        <p className="muted auth-panel-links">
          {t.auth.newHere} <Link to="/signup">{t.auth.createAccount}</Link>
        </p>
      </div>
      <div className="auth-split-visual">
        <img src="/login.jpg" alt={t.auth.loginImageAlt} width={682} height={1024} />
      </div>
    </section>
  );
}
