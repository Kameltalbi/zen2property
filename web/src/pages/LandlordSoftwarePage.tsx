import { Link } from 'react-router-dom';
import { useI18n } from '../i18n';
import { HomeIcon, type IconName } from '../landing/HomeIcon';

const workflowIcons: IconName[] = ['building', 'users', 'lease', 'coins', 'chart', 'wrench', 'file'];

function HeroActions({
  primary,
  secondary,
}: {
  primary: string;
  secondary: string;
}) {
  return (
    <p className="hero-actions seo-actions">
      <Link className="btn clay" to="/signup">
        {primary}
      </Link>
      <Link className="btn secondary" to="/pricing">
        {secondary}
      </Link>
    </p>
  );
}

export function LandlordSoftwarePage() {
  const { t } = useI18n();
  const p = t.landlordSeo;

  return (
    <article className="seo-landing">
      <section className="container seo-hero" aria-labelledby="seo-h1">
        <p className="kicker">{p.hero.kicker}</p>
        <h1 id="seo-h1">{p.hero.h1}</h1>
        <p className="lede">{p.hero.lede}</p>
        <HeroActions primary={p.hero.primary} secondary={p.hero.secondary} />
        <p className="seo-note muted">{p.hero.note}</p>
      </section>

      <section className="container seo-block" aria-labelledby="seo-problem">
        <h2 id="seo-problem">{p.problem.h2}</h2>
        <p className="lede">{p.problem.body}</p>
      </section>

      <section className="container seo-block" aria-labelledby="seo-workflow">
        <h2 id="seo-workflow">{p.workflow.h2}</h2>
        <p className="lede">{p.workflow.lede}</p>
        <div className="lp-card-grid three seo-cards">
          {p.workflow.cards.map((card, i) => (
            <article className="lp-card" key={card.title}>
              <span className="home-bento-icon" aria-hidden>
                <HomeIcon name={workflowIcons[i] ?? 'building'} />
              </span>
              <h3>{card.title}</h3>
              <p className="muted">{card.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="container seo-block" aria-labelledby="seo-rent">
        <h2 id="seo-rent">{p.rent.h2}</h2>
        <p className="lede">{p.rent.body}</p>
        <ul className="lp-bullets">
          {p.rent.points.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="container seo-block" aria-labelledby="seo-leases">
        <h2 id="seo-leases">{p.leases.h2}</h2>
        <p className="lede">{p.leases.body}</p>
        <ul className="lp-bullets">
          {p.leases.points.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="container seo-block" aria-labelledby="seo-costs">
        <h2 id="seo-costs">{p.costs.h2}</h2>
        <div className="lp-card-grid seo-split-cards">
          <article className="lp-card">
            <h3>{p.costs.expensesTitle}</h3>
            <p className="muted">{p.costs.expensesBody}</p>
          </article>
          <article className="lp-card">
            <h3>{p.costs.maintenanceTitle}</h3>
            <p className="muted">{p.costs.maintenanceBody}</p>
          </article>
        </div>
      </section>

      <section className="container seo-block" aria-labelledby="seo-docs">
        <h2 id="seo-docs">{p.documents.h2}</h2>
        <p className="lede">{p.documents.body}</p>
      </section>

      <section className="container seo-block" aria-labelledby="seo-reporting">
        <h2 id="seo-reporting">{p.reporting.h2}</h2>
        <p className="lede">{p.reporting.body}</p>
        <ul className="seo-metrics">
          {p.reporting.metrics.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <figure className="seo-shot">
          <img
            src="/capture-dashboard.jpg"
            alt={t.home.organize.imageAlt}
            width={1600}
            height={980}
            loading="lazy"
            decoding="async"
          />
        </figure>
      </section>

      <section className="container seo-block" aria-labelledby="seo-audience">
        <h2 id="seo-audience">{p.audience.h2}</h2>
        <p className="lede">{p.audience.body}</p>
        <p className="seo-audience-line">{p.audience.line}</p>
      </section>

      <section className="container seo-block" aria-labelledby="seo-why">
        <h2 id="seo-why">{p.why.h2}</h2>
        <div className="lp-card-grid seo-why-grid">
          {p.why.items.map((item) => (
            <article className="lp-card" key={item.title}>
              <h3>{item.title}</h3>
              <p className="muted">{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="container seo-block seo-faq" aria-labelledby="seo-faq">
        <h2 id="seo-faq">{p.faq.h2}</h2>
        <div className="seo-faq-list">
          {p.faq.items.map((item) => (
            <article className="lp-acc-item seo-faq-item" key={item.q}>
              <h3>{item.q}</h3>
              <p className="muted">{item.a}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="container seo-block" aria-labelledby="seo-more">
        <h2 id="seo-more" className="seo-more-title">
          {p.moreLabel}
        </h2>
        <nav className="seo-more-links" aria-label={p.moreLabel}>
          <Link to="/features">{t.footer.features}</Link>
          <Link to="/pricing">{t.nav.pricing}</Link>
          <Link to="/security">{t.footer.security}</Link>
        </nav>
      </section>

      <section className="container lp-final" aria-labelledby="seo-final">
        <div className="lp-final-inner">
          <h2 id="seo-final">{p.finalCta.h2}</h2>
          <p className="lede">{p.finalCta.body}</p>
          <div className="lp-final-actions">
            <Link className="btn clay" to="/signup">
              {p.finalCta.primary}
            </Link>
            <Link className="btn secondary" to="/pricing">
              {p.finalCta.secondary}
            </Link>
          </div>
        </div>
      </section>
    </article>
  );
}
