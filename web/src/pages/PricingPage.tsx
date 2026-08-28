import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, type Plan } from '../api';
import { useAuth } from '../auth';
import { useI18n } from '../i18n';

export function PricingPage() {
  const { user, refresh } = useAuth();
  const { t } = useI18n();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    void api<{ plans: Plan[] }>('/billing/plans').then((d) => setPlans(d.plans)).catch((e) => setError(e.message));
  }, []);

  async function subscribe(plan: Plan['id']) {
    setError('');
    setNotice('');
    if (!user) return;
    try {
      if (plan === 'FREE') {
        await api('/billing/mock-subscribe', { method: 'POST', body: JSON.stringify({ plan: 'FREE' }) });
        await refresh();
        setNotice('Switched to Starter.');
        return;
      }
      const checkout = await api<{ mock?: boolean; message?: string }>('/billing/checkout', {
        method: 'POST',
        body: JSON.stringify({ plan }),
      });
      if (checkout.mock) {
        await api('/billing/mock-subscribe', { method: 'POST', body: JSON.stringify({ plan }) });
        await refresh();
        setNotice(`Development mode: ${plan} activated without Stripe.`);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Billing failed');
    }
  }

  return (
    <section className="container section">
      <p className="kicker">{t.pricing.kicker}</p>
      <h1>{t.pricing.title}</h1>
      <p className="lede">{t.pricing.lede}</p>
      {error && <p className="error">{error}</p>}
      {notice && <p className="ok">{notice}</p>}
      <div className="grid-3" style={{ marginTop: 28 }}>
        {plans.map((plan) => (
          <article className="card" key={plan.id}>
            <h3>{plan.name}</h3>
            <p className="price">
              ${plan.monthlyUsd}
              <span> {t.pricing.perMonth}</span>
            </p>
            <p className="muted">{plan.tagline}</p>
            <ul className="muted">
              <li>{plan.maxProperties === null ? t.pricing.unlimited : `${plan.maxProperties} ${t.pricing.units}`}</li>
              <li>{t.pricing.receipts}</li>
              <li>{plan.aiLegal ? t.pricing.aiYes : t.pricing.aiNo}</li>
            </ul>
            {user ? (
              <button className="btn" onClick={() => void subscribe(plan.id)} disabled={user.plan === plan.id}>
                {user.plan === plan.id ? t.pricing.current : t.pricing.choose}
              </button>
            ) : (
              <Link className="btn" to="/signup">
                {t.pricing.start}
              </Link>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
