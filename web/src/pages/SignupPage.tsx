import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PasswordField } from '../PasswordField';
import { homePath } from '../api';
import { useAuth } from '../auth';
import { useI18n } from '../i18n';
import { storeBillingCountry } from '../lib/billingCountry';
import { countryLabel, useCountries } from '../lib/countries';

const CA_PROVINCES = [
  { code: 'AB', en: 'Alberta', fr: 'Alberta' },
  { code: 'BC', en: 'British Columbia', fr: 'Colombie-Britannique' },
  { code: 'MB', en: 'Manitoba', fr: 'Manitoba' },
  { code: 'NB', en: 'New Brunswick', fr: 'Nouveau-Brunswick' },
  { code: 'NL', en: 'Newfoundland and Labrador', fr: 'Terre-Neuve-et-Labrador' },
  { code: 'NS', en: 'Nova Scotia', fr: 'Nouvelle-Écosse' },
  { code: 'NT', en: 'Northwest Territories', fr: 'Territoires du Nord-Ouest' },
  { code: 'NU', en: 'Nunavut', fr: 'Nunavut' },
  { code: 'ON', en: 'Ontario', fr: 'Ontario' },
  { code: 'PE', en: 'Prince Edward Island', fr: 'Île-du-Prince-Édouard' },
  { code: 'QC', en: 'Quebec', fr: 'Québec' },
  { code: 'SK', en: 'Saskatchewan', fr: 'Saskatchewan' },
  { code: 'YT', en: 'Yukon', fr: 'Yukon' },
];

export function SignupPage() {
  const { register } = useAuth();
  const { t, locale } = useI18n();
  const navigate = useNavigate();
  const countries = useCountries();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [countryCode, setCountryCode] = useState(locale === 'fr' ? 'FR' : 'CA');
  const [province, setProvince] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!countries.some((c) => c.code === countryCode) && countries[0]) {
      setCountryCode(countries[0].code);
    }
  }, [countries, countryCode]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError(t.auth.passwordMismatch);
      return;
    }
    if (countryCode === 'CA' && !province) {
      setError(t.auth.provinceRequired);
      return;
    }
    try {
      const user = await register({
        fullName,
        email,
        password,
        countryCode,
        billingCountryCode: countryCode,
        billingRegion: countryCode === 'CA' ? province : null,
      });
      storeBillingCountry(countryCode);
      navigate(homePath(user));
    } catch (err) {
      setError(err instanceof Error ? err.message : t.auth.signupFailed);
    }
  }

  return (
    <section className="auth-split">
      <div className="auth-split-visual">
        <img src="/signup.jpg" alt={t.auth.signupImageAlt} width={1024} height={576} />
      </div>
      <div className="auth-split-form">
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
          <PasswordField
            label={t.auth.password}
            value={password}
            onChange={setPassword}
            show={showPassword}
            onToggleShow={() => setShowPassword((v) => !v)}
            showLabel={t.auth.showPassword}
            hideLabel={t.auth.hidePassword}
          />
          <PasswordField
            label={t.auth.confirmPassword}
            value={confirmPassword}
            onChange={setConfirmPassword}
            show={showConfirm}
            onToggleShow={() => setShowConfirm((v) => !v)}
            showLabel={t.auth.showPassword}
            hideLabel={t.auth.hidePassword}
          />
          <label>
            {t.auth.billingCountry}
            <select
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value)}
              required
            >
              {countries.map((c) => (
                <option key={c.code} value={c.code}>
                  {countryLabel(c.code, locale)}
                </option>
              ))}
            </select>
          </label>
          {countryCode === 'CA' && (
            <label>
              {t.auth.province}
              <select
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                required
              >
                <option value="">{t.auth.provincePlaceholder}</option>
                {CA_PROVINCES.map((p) => (
                  <option key={p.code} value={p.code}>
                    {locale === 'fr' ? p.fr : p.en}
                  </option>
                ))}
              </select>
            </label>
          )}
          {error && <p className="error">{error}</p>}
          <button className="btn clay" type="submit">
            {t.auth.startFree}
          </button>
        </form>
        <p className="muted">
          {t.auth.already} <Link to="/login">{t.nav.login}</Link>
        </p>
      </div>
    </section>
  );
}
