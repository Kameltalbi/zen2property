import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth';
import { useI18n } from '../i18n';
import { countryLabel, useCountries } from '../lib/countries';

export function SignupPage() {
  const { register } = useAuth();
  const { t, locale } = useI18n();
  const navigate = useNavigate();
  const countries = useCountries();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [countryCode, setCountryCode] = useState(locale === 'fr' ? 'FR' : 'GB');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!countries.some((c) => c.code === countryCode) && countries[0]) {
      setCountryCode(countries[0].code);
    }
  }, [countries, countryCode]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    try {
      await register({ fullName, email, password, countryCode });
      navigate('/app');
    } catch (err) {
      setError(err instanceof Error ? err.message : t.auth.signupFailed);
    }
  }

  return (
    <section className="narrow section">
      <h1>{t.auth.signupTitle}</h1>
      <p className="muted">{t.auth.signupLede}</p>
      <form className="form" onSubmit={(e) => void onSubmit(e)}>
        <label>
          {t.auth.fullName}
          <input value={fullName} onChange={(e) => setFullName(e.target.value)} required autoComplete="name" />
        </label>
        <label>
          {t.auth.email}
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
        </label>
        <label>
          {t.auth.password}
          <input type="password" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="new-password" />
        </label>
        <label>
          {t.auth.country}
          <select value={countryCode} onChange={(e) => setCountryCode(e.target.value)}>
            {countries.map((c) => (
              <option key={c.code} value={c.code}>
                {countryLabel(c.code, locale)}
              </option>
            ))}
          </select>
        </label>
        {error && <p className="error">{error}</p>}
        <button className="btn clay" type="submit">
          {t.auth.startFree}
        </button>
      </form>
      <p className="muted">
        {t.auth.already} <Link to="/login">{t.nav.login}</Link>
      </p>
    </section>
  );
}
