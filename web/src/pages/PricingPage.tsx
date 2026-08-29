import { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api, type PlanCatalog, type PlanCatalogPlan } from '../api';
import { useAuth } from '../auth';
import { useI18n } from '../i18n';
import { detectSuggestedCountry, readStoredBillingCountry, storeBillingCountry } from '../lib/billingCountry';

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
    if (checkout === 'success') {
      setNotice(
        locale === 'fr'
          ? 'Paiement reçu. Votre abonnement sera activé dès confirmation Stripe (webhook).'
          : 'Payment received. Your plan activates once Stripe confirms (webhook).',
      );
      void refresh();
    } else if (checkout === 'cancel') {
      setNotice(locale === 'fr' ? 'Checkout annulé.' : 'Checkout canceled.');
    }
    setSearchParams({}, { replace: true });
  }, [searchParams, setSearchParams, locale, refresh]);

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

  async function subscribe(plan: PlanCatalogPlan) {
    setError('');
    setNotice('');
    if (!user) return;
    try {
      if (plan.code === 'free') {
        await api('/billing/mock-subscribe', { method: 'POST', body: JSON.stringify({ plan: 'FREE' }) });
        await refresh();
        setNotice(locale === 'fr' ? 'Offre Zen Free activée.' : 'Zen Free activated.');
        return;
      }
      const checkout = await api<{
        mock?: boolean;
        checkoutUrl?: string | null;
        chargeDiffersFromDisplay?: boolean;
        chargeCurrency?: string;
        displayCurrency?: string;
      }>('/billing/checkout', {
        method: 'POST',
        body: JSON.stringify({ plan: plan.code, billingPeriod: cycle }),
      });
      if (checkout.checkoutUrl) {
        window.location.assign(checkout.checkoutUrl);
        return;
      }
      if (checkout.chargeDiffersFromDisplay) {
        setNotice(
          locale === 'fr'
            ? `Affiché en ${checkout.displayCurrency}. Le paiement Stripe sera en ${checkout.chargeCurrency}.`
            : `Shown in ${checkout.displayCurrency}. Stripe will charge ${checkout.chargeCurrency}.`,
        );
      }
      if (checkout.mock) {
        await api('/billing/mock-subscribe', {
          method: 'POST',
          body: JSON.stringify({ plan: plan.id }),
        });
        await refresh();
        setNotice(
          locale === 'fr'
            ? `Mode développement : ${plan.name} activé (sans paiement réel).`
            : `Development mode: ${plan.name} activated (no real charge).`,
        );
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Billing failed');
    }
  }

  function ctaFor(plan: PlanCatalogPlan): string {
    if (plan.code === 'free') return t.pricing.startFree;
    if (plan.code === 'premium') return t.pricing.choosePremium;
    return t.pricing.choosePro;
  }

  function featuresFor(code: PlanCatalogPlan['code']): readonly string[] {
    if (code === 'free') return t.pricing.featuresFree;
    if (code === 'premium') return t.pricing.featuresPremium;
    return t.pricing.featuresPro;
  }

  function taglineFor(code: PlanCatalogPlan['code']): string {
    if (code === 'free') return t.pricing.taglineFree;
    if (code === 'premium') return t.pricing.taglineInvestor;
    return t.pricing.taglinePro;
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

      <div className="grid-3 pricing-grid">
        {(catalog?.plans ?? []).map((plan) => {
          const price =
            cycle === 'yearly'
              ? { main: plan.yearlyFormatted, hint: t.pricing.perYear }
              : { main: plan.monthlyFormatted, hint: t.pricing.perMonth };
          return (
            <article className={`card pricing-card${plan.popular ? ' is-popular' : ''}`} key={plan.id}>
              {plan.popular && <p className="pricing-badge">{t.pricing.popular}</p>}
              <h3>{plan.name}</h3>
              <p className="price">
                {price.main}
                <span> {price.hint}</span>
              </p>
              <p className="muted">{taglineFor(plan.code)}</p>
              <p className="pricing-limit">
                {plan.maxProperties === 1
                  ? `1 ${t.pricing.units}`
                  : `${t.pricing.upTo} ${plan.maxProperties} ${t.pricing.units}`}
              </p>
              <ul className="muted pricing-features">
                {featuresFor(plan.code).map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
              {user ? (
                <button
                  className={`btn${plan.popular ? ' clay' : ''}`}
                  onClick={() => void subscribe(plan)}
                  disabled={user.plan === plan.id || (user.plan === 'INVESTOR' && plan.id === 'PREMIUM')}
                >
                  {user.plan === plan.id || (user.plan === 'INVESTOR' && plan.id === 'PREMIUM')
                    ? t.pricing.current
                    : ctaFor(plan)}
                </button>
              ) : (
                <Link className={`btn${plan.popular ? ' clay' : ''}`} to="/signup">
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
