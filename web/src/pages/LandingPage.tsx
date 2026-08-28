import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useI18n } from '../i18n';

export function LandingPage() {
  const { t } = useI18n();
  const { hash } = useLocation();

  useEffect(() => {
    if (!hash) return;
    document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [hash]);

  return (
    <>
      <section className="container hero">
        <div>
          <p className="kicker">{t.hero.kicker}</p>
          <h1>{t.hero.title}</h1>
          <p className="lede">{t.hero.lede}</p>
          <p className="hero-actions">
            <Link className="btn clay" to="/signup">
              {t.hero.cta}
            </Link>
            <Link className="btn secondary" to="/pricing">
              {t.hero.seePlans}
            </Link>
          </p>
        </div>
        <aside className="hero-panel">
          <p className="kicker" style={{ color: '#9fc5b3' }}>
            {t.hero.panelKicker}
          </p>
          <h2 style={{ color: 'white', fontSize: '2rem' }}>{t.hero.panelTitle}</h2>
          <p>{t.hero.panelBody}</p>
        </aside>
      </section>

      <section className="container section" id="features">
        <p className="kicker">{t.features.kicker}</p>
        <h2>{t.features.title}</h2>
        <div className="grid-3" style={{ marginTop: 22 }}>
          <article className="card">
            <h3>{t.features.manageTitle}</h3>
            <p className="muted">{t.features.manageBody}</p>
          </article>
          <article className="card">
            <h3>{t.features.receiptTitle}</h3>
            <p className="muted">{t.features.receiptBody}</p>
          </article>
          <article className="card">
            <h3>{t.features.countryTitle}</h3>
            <p className="muted">{t.features.countryBody}</p>
          </article>
        </div>
      </section>

      <section className="container section" id="faq">
        <p className="kicker">{t.faq.kicker}</p>
        <h2>{t.faq.title}</h2>
        <div className="faq-list">
          <article className="card">
            <h3>{t.faq.q1}</h3>
            <p className="muted">{t.faq.a1}</p>
          </article>
          <article className="card">
            <h3>{t.faq.q2}</h3>
            <p className="muted">{t.faq.a2}</p>
          </article>
          <article className="card">
            <h3>{t.faq.q3}</h3>
            <p className="muted">{t.faq.a3}</p>
          </article>
          <article className="card">
            <h3>{t.faq.q4}</h3>
            <p className="muted">{t.faq.a4}</p>
          </article>
        </div>
      </section>
    </>
  );
}
