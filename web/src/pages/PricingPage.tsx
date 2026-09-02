import { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api, type PlanCatalog, type PlanCatalogPlan } from '../api';
import { useAuth } from '../auth';
import { useI18n } from '../i18n';
import { detectSuggestedCountry, readStoredBillingCountry, storeBillingCountry } from '../lib/billingCountry';
import { checkoutPath } from '../lib/paths';

type BillingCycle = 'monthly' | 'yearly';

type BillingCountryOption = { code: string; label: string };

export function PricingPage() {
  const { user, refresh } = useAuth();
  const { t, locale } = useI18n();
  const [searchParams, setSearchParams] = useSearchParams();
  const [catalog, setCatalog] = useState<PlanCatalog | null>(null);
  const [countries, setCountries] = useState<BillingCountryOption[]>([]);
  const [country, setCountry] = useState('CA');
  const [cycle, setCycle] = useState<BillingCycle>('monthly');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [suggestion, setSuggestion] = useState<string | null>(null);

  const loadCatalog = useCallback(async (code: string) => {
    const data = await api<PlanCatalog>(`/billing/plans?country=${encodeURIComponent(code)}`);
    setCatalog(data);
  }, []);

  useEffect(() => {
    void api<{ countries: BillingCountryOption[] }>('/billing/countries')
      .then((d) => setCountries(d.countries))
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    const checkout = searchParams.get('checkout');
    if (!checkout) return;
    setSearchParams({}, { replace: true });
    if (checkout === 'success') {
      window.location.replace('/checkout/success');
      return;
    }
    if (checkout === 'cancel') {
      setNotice(t.checkout.canceled);
    }
  }, [searchParams, setSearchParams, t.checkout.canceled]);

  useEffect(() => {
    const profileCountry = user?.billingCountryCode ?? user?.countryCode;
    const stored = readStoredBillingCountry();
    const detected = detectSuggestedCountry();

    if (profileCountry) {
      setCountry(profileCountry);
      storeBillingCountry(profileCountry);
      return;
    }
    if (stored) {
      setCountry(stored);
      return;
    }
    if (detected) {
      setSuggestion(detected);
      setCountry(detected);
      return;
    }
    setCountry('US');
  }, [user?.billingCountryCode, user?.countryCode]);

  useEffect(() => {
    void loadCatalog(country).catch((e) =>
      setError(e instanceof Error ? e.message : 'Unable to load plans'),
    );
  }, [country, loadCatalog]);

  async function onCountryChange(next: string) {
    setError('');
    setNotice('');
    setSuggestion(null);
    setCountry(next);
    storeBillingCountry(next === 'XX' ? 'US' : next);

    if (user) {
      try {
        await api('/billing/country', {
          method: 'PATCH',
          body: JSON.stringify({ billingCountryCode: next === 'XX' ? 'US' : next }),
        });
        await refresh();
      } catch (e) {
        const err = e as Error & { details?: { message?: string } };
        if (err.message === 'CURRENCY_CHANGE_REQUIRES_CONFIRMATION') {
          setError(t.pricing.currencyChangeNotice);
          return;
        }
        setError(err.message);
      }
    }
  }

  async function activateFree() {
    setError('');
    setNotice('');
    if (!user) return;
    try {
      await api('/billing/mock-subscribe', { method: 'POST', body: JSON.stringify({ plan: 'FREE' }) });
      await refresh();
      setNotice(locale === 'fr' ? 'Offre Rentelyo Free activée.' : 'Rentelyo Free activated.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Billing failed');
    }
  }

  function ctaFor(plan: PlanCatalogPlan): string {
    if (plan.code === 'free') return t.pricing.startFree;
    if (plan.code === 'smart') return t.pricing.chooseSmart;
    if (plan.code === 'premium') return t.pricing.choosePremium;
    return t.pricing.contactUs;
  }

  function featuresFor(code: PlanCatalogPlan['code']): readonly string[] {
    if (code === 'free') return t.pricing.featuresFree;
    if (code === 'smart') return t.pricing.featuresSmart;
    if (code === 'premium') return t.pricing.featuresPremium;
    return t.pricing.featuresPro;
  }

  function taglineFor(code: PlanCatalogPlan['code']): string {
    if (code === 'free') return t.pricing.taglineFree;
    if (code === 'smart') return t.pricing.taglineSmart;
    if (code === 'premium') return t.pricing.taglineInvestor;
    return t.pricing.taglinePro;
  }

  function limitLine(count: number | null, unit: string): string {
    if (count == null) return t.pricing.customLimits;
    if (count === 1) return `1 ${unit}`;
    return `${t.pricing.upTo} ${count} ${unit}`;
  }

  const countryLabel =
    countries.find((c) => c.code === country)?.label ??
    (country === 'XX' ? t.pricing.otherCountry : country);

  return (
    <section className="container section">
      <p className="kicker">{t.pricing.kicker}</p>
      <h1>{t.pricing.title}</h1>
      <p className="lede">{t.pricing.lede}</p>

      <div className="pricing-controls">
        <label className="pricing-country">
          <span>{t.pricing.billingCountry}</span>
          <select value={country} onChange={(e) => void onCountryChange(e.target.value)}>
            {countries.map((c) => (
              <option key={c.code} value={c.code}>
                {c.label}
              </option>
            ))}
          </select>
        </label>

        <div className="ws-segment pricing-cycle" role="group" aria-label={t.pricing.monthly}>
          <button type="button" className={cycle === 'monthly' ? 'on' : ''} onClick={() => setCycle('monthly')}>
            {t.pricing.monthly}
          </button>
          <button type="button" className={cycle === 'yearly' ? 'on' : ''} onClick={() => setCycle('yearly')}>
            {t.pricing.annual}
            <span className="pricing-save">{t.pricing.annualSave}</span>
          </button>
        </div>
      </div>

      {suggestion && suggestion === country && !user && (
        <div className="banner pricing-detect">
          <p>
            {t.pricing.detectedPrefix} <strong>{countryLabel}</strong>. {t.pricing.detectedAsk}
          </p>
          <div className="ws-actions">
            <button
              type="button"
              className="btn"
              onClick={() => {
                storeBillingCountry(suggestion);
                setSuggestion(null);
              }}
            >
              {t.pricing.useDetected}
            </button>
            <button type="button" className="btn secondary" onClick={() => setSuggestion(null)}>
              {t.pricing.chooseOther}
            </button>
          </div>
        </div>
      )}

      {catalog?.chargeDiffersFromDisplay && catalog.chargeDisclosure && (
        <p className="banner">{catalog.chargeDisclosure.message}</p>
      )}

      {error && <p className="error">{error}</p>}
      {notice && <p className="ok">{notice}</p>}

      <div className="grid-4 pricing-grid">
        {(catalog?.plans ?? []).map((plan) => {
          const custom = plan.custom || plan.code === 'agency';
          const price = custom
            ? { main: t.pricing.customPrice, hint: '' }
            : cycle === 'yearly'
              ? { main: plan.yearlyFormatted, hint: t.pricing.perYear }
              : { main: plan.monthlyFormatted, hint: t.pricing.perMonth };
          return (
            <article className={`card pricing-card${plan.popular ? ' is-popular' : ''}`} key={plan.id}>
              {plan.popular && <p className="pricing-badge">{t.pricing.popular}</p>}
              <h3>{plan.name}</h3>
              <p className="price">
                {price.main}
                {price.hint ? <span> {price.hint}</span> : null}
              </p>
              <p className="muted">{taglineFor(plan.code)}</p>
              <p className="pricing-limit">{limitLine(plan.maxProperties, t.pricing.units)}</p>
              <p className="pricing-limit">{limitLine(plan.maxUsers, t.pricing.users)}</p>
              <ul className="muted pricing-features">
                {featuresFor(plan.code).map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
              {plan.code === 'free' ? (
                user ? (
                  <button
                    className="btn"
                    onClick={() => void activateFree()}
                    disabled={user.plan === plan.id}
                  >
                    {user.plan === plan.id ? t.pricing.current : ctaFor(plan)}
                  </button>
                ) : (
                  <Link className="btn" to="/signup">
                    {ctaFor(plan)}
                  </Link>
                )
              ) : plan.code === 'agency' ? (
                <Link className="btn secondary" to="/contact">
                  {t.pricing.contactUs}
                </Link>
              ) : user && user.plan === plan.id ? (
                <button className={`btn${plan.popular ? ' clay' : ''}`} disabled>
                  {t.pricing.current}
                </button>
              ) : (
                <Link className={`btn${plan.popular ? ' clay' : ''}`} to={checkoutPath(plan.code, cycle)}>
                  {ctaFor(plan)}
                </Link>
              )}
            </article>
          );
        })}
      </div>

      <p className="muted pricing-note">{t.pricing.overPremium}</p>
      <p className="muted pricing-note">{t.pricing.overPro}</p>
      <p className="muted pricing-tax">{t.pricing.taxNote}</p>
    </section>
  );
}
