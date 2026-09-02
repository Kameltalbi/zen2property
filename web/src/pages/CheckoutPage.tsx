import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { api, homePath, type PlanCatalog } from '../api';
import { useAuth } from '../auth';
import { DEFAULT_COUNTRY, useI18n } from '../i18n';
import { authNextQuery, checkoutPath, parsePaidPlan, parsePeriod } from '../lib/paths';

function StripeMark() {
  return <span className="stripe-word">stripe</span>;
}

export function CheckoutPage() {
  const { user, loading, refresh } = useAuth();
  const { t, locale } = useI18n();
  const [params, setParams] = useSearchParams();
  const planCode = parsePaidPlan(params.get('plan'));
  const period = parsePeriod(params.get('period'));
  const canceled = params.get('status') === 'cancel';
  const [catalog, setCatalog] = useState<PlanCatalog | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);

  const country = user?.billingCountryCode ?? user?.countryCode ?? DEFAULT_COUNTRY[locale];

  useEffect(() => {
    if (canceled) {
      setNotice(t.checkout.canceled);
      params.delete('status');
      setParams(params, { replace: true });
    }
  }, [canceled, params, setParams, t.checkout.canceled]);

  useEffect(() => {
    void api<PlanCatalog>(`/billing/plans?country=${encodeURIComponent(country)}`)
      .then(setCatalog)
      .catch((e) => setError(e instanceof Error ? e.message : t.checkout.loadFailed));
  }, [country, t.checkout.loadFailed]);

  const plan = useMemo(
    () => catalog?.plans.find((p) => p.code === planCode) ?? null,
    [catalog, planCode],
  );

  if (!planCode) return <Navigate to="/pricing" replace />;

  const next = checkoutPath(planCode, period);
  const price = plan
    ? period === 'yearly'
      ? { main: plan.yearlyFormatted, hint: t.pricing.perYear }
      : { main: plan.monthlyFormatted, hint: t.pricing.perMonth }
    : null;
  const features =
    planCode === 'premium' ? t.pricing.featuresPremium : t.pricing.featuresSmart;
  const alreadyOnPlan = Boolean(user && plan && user.plan === plan.id);

  async function pay() {
    if (!plan || !user) return;
    setError('');
    setNotice('');
    setBusy(true);
    try {
      const checkout = await api<{
        mock?: boolean;
        checkoutUrl?: string | null;
        chargeDiffersFromDisplay?: boolean;
        chargeCurrency?: string;
        displayCurrency?: string;
      }>('/billing/checkout', {
        method: 'POST',
        body: JSON.stringify({ plan: plan.code, billingPeriod: period }),
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
        window.location.assign('/checkout/success');
        return;
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : t.checkout.payFailed);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="container section checkout-page">
      <p className="kicker">{t.checkout.kicker}</p>
      <h1>{t.checkout.title}</h1>
      <p className="lede">{t.checkout.lede}</p>
      <p>
        <Link className="auth-home-link" to="/pricing">
          {t.checkout.backPricing}
        </Link>
      </p>

      {error && <p className="error">{error}</p>}
      {notice && <p className="ok">{notice}</p>}
      {alreadyOnPlan && <p className="ok">{t.checkout.already}</p>}

      <div className="checkout-grid">
        <article className="card checkout-summary">
          <p className="muted">{t.checkout.summary}</p>
          <h2>{plan?.name ?? 'Rentelyo'}</h2>
          {price && (
            <p className="price">
              {price.main}
              <span> {price.hint}</span>
            </p>
          )}
          <div className="ws-segment pricing-cycle" role="group" aria-label={t.checkout.period}>
            <button
              type="button"
              className={period === 'monthly' ? 'on' : ''}
              onClick={() => setParams({ plan: planCode, period: 'monthly' })}
            >
              {t.pricing.monthly}
            </button>
            <button
              type="button"
              className={period === 'yearly' ? 'on' : ''}
              onClick={() => setParams({ plan: planCode, period: 'yearly' })}
            >
              {t.pricing.annual}
              <span className="pricing-save">{t.pricing.annualSave}</span>
            </button>
          </div>
          <ul className="muted pricing-features">
            {features.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
          {catalog?.chargeDiffersFromDisplay && catalog.chargeDisclosure && (
            <p className="muted">{catalog.chargeDisclosure.message}</p>
          )}
          <p className="muted pricing-tax">{t.pricing.taxNote}</p>
        </article>

        <article className="card checkout-pay">
          <h2>{t.checkout.payTitle}</h2>
          {loading ? (
            <p className="muted">{t.checkout.loading}</p>
          ) : user ? (
            <>
              <p className="muted">
                {user.email}
                {catalog ? ` · ${catalog.displayCurrency}` : ''}
              </p>
              <button className="btn clay" type="button" disabled={busy || alreadyOnPlan} onClick={() => void pay()}>
                {busy ? t.checkout.redirecting : t.checkout.payStripe}
              </button>
              <p className="checkout-secure muted">
                <StripeMark />
                {t.checkout.secure}
              </p>
            </>
          ) : (
            <>
              <p>{t.checkout.needAccount}</p>
              <div className="checkout-auth-actions">
                <Link className="btn clay" to={`/signup?${authNextQuery(next)}`}>
                  {t.auth.createAccount}
                </Link>
                <Link className="btn secondary" to={`/login?${authNextQuery(next)}`}>
                  {t.nav.login}
                </Link>
              </div>
              <p className="checkout-secure muted">
                <StripeMark />
                {t.checkout.secure}
              </p>
            </>
          )}
        </article>
      </div>
    </section>
  );
}

export function CheckoutSuccessPage() {
  const { user } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const planCode = parsePaidPlan(params.get('plan')) ?? parsePaidPlan(user?.plan ?? null);
  const periodParam = params.get('period');
  const period = periodParam === 'yearly' || periodParam === 'monthly' ? periodParam : 'monthly';
  const planName = planCode === 'premium' ? t.checkout.planPremium : planCode === 'smart' ? t.checkout.planSmart : null;
  const title = planName
    ? t.checkout.successWelcome.replace('{plan}', planName)
    : t.checkout.successWelcomeGeneric;

  useEffect(() => {
    void (async () => {
      try {
        await api('/billing/me');
      } catch {
        /* webhook may still be in flight */
      }
    })();
  }, []);

  return (
    <section className="container section checkout-success">
      <article className="card checkout-success-card">
        <span className="checkout-success-icon" aria-hidden>
          <svg viewBox="0 0 24 24" width="22" height="22">
            <path
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 12.5 9.5 17 19 7.5"
            />
          </svg>
        </span>
        <p className="checkout-success-confirmed">{t.checkout.successTitle}</p>
        <h1>{title}</h1>
        <p className="checkout-success-lede">
          {t.checkout.successBody}
          <br />
          {t.checkout.successHint}
        </p>
        <dl className="checkout-success-summary">
          <div>
            <dt>{t.checkout.successPlan}</dt>
            <dd>{planName ?? '—'}</dd>
          </div>
          <div>
            <dt>{t.checkout.successBilling}</dt>
            <dd>{period === 'yearly' ? t.checkout.periodYearly : t.checkout.periodMonthly}</dd>
          </div>
          <div>
            <dt>{t.checkout.successStatus}</dt>
            <dd>{t.checkout.successActive}</dd>
          </div>
        </dl>
        <div className="checkout-success-actions">
          <button className="btn clay" type="button" onClick={() => navigate(user ? homePath(user) : '/login')}>
            {user ? t.checkout.openApp : t.nav.login}
          </button>
          <Link className="checkout-success-manage" to={user ? '/pricing' : '/login'}>
            {t.checkout.manageSubscription}
          </Link>
        </div>
        <p className="checkout-success-stripe">{t.checkout.paidByStripe}</p>
      </article>
    </section>
  );
}
