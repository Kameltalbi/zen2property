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
      <section className="home-hero" aria-label={t.hero.imageAlt}>
        <div className="container">
          <div className="home-hero-copy">
            <p className="kicker">{t.hero.kicker}</p>
            <h1>{t.hero.title}</h1>
            <p className="lede">{t.hero.lede}</p>
            <p className="hero-actions">
              <Link className="btn clay" to="/signup">
                {t.hero.cta}
              </Link>
              <a className="btn secondary hero-download" href="#android">
                <svg className="hero-download-icon" viewBox="0 0 24 24" width="18" height="18" aria-hidden>
                  <path
                    fill="currentColor"
                    d="M17.6 9.48 19.4 6.3a.5.5 0 0 0-.86-.5l-1.75 3.03A11.4 11.4 0 0 0 12 8c-1.7 0-3.3.35-4.79.83L5.46 5.8a.5.5 0 1 0-.86.5l1.8 3.18C3.5 11.05 2 13.6 2 16.5h20c0-2.9-1.5-5.45-4.4-7.02ZM7.25 14.25a1 1 0 1 1 0-2 1 1 0 0 1 0 2Zm9.5 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z"
                  />
                </svg>
                {t.hero.download}
              </a>
            </p>
          </div>
        </div>
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
