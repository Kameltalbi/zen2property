import { Link } from 'react-router-dom';
import { useI18n } from '../i18n';
import { AppScreen } from '../landing/AppScreen';
import { BrowserFrame } from '../landing/BrowserFrame';
import { HomeIcon, type IconName } from '../landing/HomeIcon';

const flowIcons: IconName[] = ['building', 'users', 'lease', 'coins', 'wrench', 'file'];

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

export function SimpleLandlordSoftwarePage() {
  const { t } = useI18n();
  const p = t.simpleLandlord;

  return (
    <article className="seo-landing">
      <section className="seo-band seo-hero-band" aria-labelledby="seo-h1">
        <div className="seo-wrap seo-split is-hero">
          <div className="seo-split-copy">
            <p className="kicker">{p.hero.kicker}</p>
            <h1 id="seo-h1">{p.hero.h1}</h1>
            <p className="lede">{p.hero.lede}</p>
            <HeroActions primary={p.hero.primary} secondary={p.hero.secondary} />
            <p className="seo-note muted">{p.hero.note}</p>
          </div>
          <div className="seo-split-visual">
            <BrowserFrame title="app.rentelyo.com" flush className="seo-product-frame">
              <img
                src="/capture-dashboard.jpg"
                alt={t.home.organize.imageAlt}
                width={1600}
                height={980}
                fetchPriority="high"
                decoding="async"
              />
            </BrowserFrame>
          </div>
        </div>
      </section>

      <section className="seo-band is-paper" aria-labelledby="seo-pain">
        <div className="seo-wrap">
          <div className="seo-section-intro is-center">
            <h2 id="seo-pain">{p.pain.h2}</h2>
            <p className="lede">{p.pain.body}</p>
          </div>
          <div className="seo-vs">
            <article className="seo-vs-col is-before">
              <h3>{p.pain.beforeTitle}</h3>
              <ul>
                {p.pain.before.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
            <article className="seo-vs-col is-after">
              <h3>{p.pain.afterTitle}</h3>
              <ul>
                {p.pain.after.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <p className="seo-vs-note">{p.pain.afterNote}</p>
            </article>
          </div>
        </div>
      </section>

      <section className="seo-band is-surface" aria-labelledby="seo-flow">
        <div className="seo-wrap">
          <div className="seo-section-intro">
            <h2 id="seo-flow">{p.flow.h2}</h2>
            <p className="lede">{p.flow.lede}</p>
          </div>
          <ol className="seo-flow">
            {p.flow.steps.map((step, i) => (
              <li key={step.title} className="seo-flow-item">
                {i > 0 ? <span className="seo-flow-connector" aria-hidden /> : null}
                <div className="seo-flow-card">
                  <span className="seo-flow-icon" aria-hidden>
                    <HomeIcon name={flowIcons[i] ?? 'building'} />
                  </span>
                  <div>
                    <p className="seo-flow-label">{step.title}</p>
                    <p>{step.body}</p>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="seo-band is-paper" aria-labelledby="seo-organize">
        <div className="seo-wrap seo-split">
          <div className="seo-split-copy">
            <h2 id="seo-organize">{p.organize.h2}</h2>
            <p className="lede">{p.organize.body}</p>
            <ul className="lp-bullets">
              {p.organize.points.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="seo-split-visual">
            <BrowserFrame title="app.rentelyo.com" flush className="seo-product-frame">
              <img
                src="/capture-properties.jpg"
                alt={p.organize.h2}
                width={1600}
                height={980}
                loading="lazy"
                decoding="async"
              />
            </BrowserFrame>
          </div>
        </div>
      </section>

      <section className="seo-band is-surface" aria-labelledby="seo-lease-rent">
        <div className="seo-wrap seo-split is-reverse">
          <div className="seo-split-copy">
            <h2 id="seo-lease-rent">{p.leaseRent.h2}</h2>
            <p className="lede">{p.leaseRent.body}</p>
            <div className="seo-two-lists">
              <div>
                <h3>{p.leaseRent.leaseTitle}</h3>
                <ul className="lp-bullets">
                  {p.leaseRent.leasePoints.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3>{p.leaseRent.rentTitle}</h3>
                <ul className="lp-bullets">
                  {p.leaseRent.rentPoints.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          <div className="seo-split-visual">
            <BrowserFrame title="app.rentelyo.com" flush className="seo-product-frame">
              <img
                src="/capture-lease.jpg"
                alt={p.leaseRent.h2}
                width={1200}
                height={800}
                loading="lazy"
                decoding="async"
              />
            </BrowserFrame>
          </div>
        </div>
      </section>

      <section className="seo-band is-tint" aria-labelledby="seo-costs">
        <div className="seo-wrap">
          <div className="seo-section-intro">
            <h2 id="seo-costs">{p.costs.h2}</h2>
          </div>
          <div className="seo-cost-grid">
            <article className="seo-cost-card">
              <h3>{p.costs.expensesTitle}</h3>
              <p>{p.costs.expensesBody}</p>
              <ul className="lp-bullets">
                {p.costs.expensesPoints.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <BrowserFrame title="app.rentelyo.com" className="seo-product-frame">
                <AppScreen screen="finances" />
              </BrowserFrame>
            </article>
            <article className="seo-cost-card">
              <h3>{p.costs.maintenanceTitle}</h3>
              <p>{p.costs.maintenanceBody}</p>
              <ul className="lp-bullets">
                {p.costs.maintenancePoints.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <BrowserFrame title="app.rentelyo.com" className="seo-product-frame">
                <AppScreen screen="maintenance" />
              </BrowserFrame>
            </article>
          </div>
        </div>
      </section>

      <section className="seo-band is-surface" aria-labelledby="seo-docs">
        <div className="seo-wrap seo-split">
          <div className="seo-split-copy">
            <h2 id="seo-docs">{p.documents.h2}</h2>
            <p className="lede">{p.documents.body}</p>
            <ul className="lp-bullets">
              {p.documents.points.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="seo-split-visual">
            <BrowserFrame title="app.rentelyo.com" className="seo-product-frame">
              <AppScreen screen="documents" />
            </BrowserFrame>
          </div>
        </div>
      </section>

      <section className="seo-band is-paper" aria-labelledby="seo-dash">
        <div className="seo-wrap">
          <div className="seo-section-intro is-center">
            <h2 id="seo-dash">{p.dashboard.h2}</h2>
            <p className="lede">{p.dashboard.body}</p>
          </div>
          <ul className="seo-metrics">
            {p.dashboard.metrics.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <BrowserFrame title="app.rentelyo.com" flush className="seo-product-frame seo-dash-frame">
            <img
              src="/capture-dashboard.jpg"
              alt={p.dashboard.h2}
              width={1600}
              height={980}
              loading="lazy"
              decoding="async"
            />
          </BrowserFrame>
        </div>
      </section>

      <section className="seo-band is-surface" aria-labelledby="seo-independent">
        <div className="seo-wrap">
          <div className="seo-independent">
            <div>
              <h2 id="seo-independent">{p.independent.h2}</h2>
              <p className="lede">{p.independent.body}</p>
              <p className="seo-independent-line">{p.independent.line}</p>
            </div>
            <p className="seo-independent-plan">{p.independent.plan}</p>
          </div>
        </div>
      </section>

      <section className="seo-band is-paper" aria-labelledby="seo-compare">
        <div className="seo-wrap">
          <div className="seo-section-intro">
            <h2 id="seo-compare">{p.compare.h2}</h2>
            <p className="lede">{p.compare.body}</p>
          </div>
          <div className="seo-compare" role="table" aria-label={p.compare.h2}>
            <div className="seo-compare-head" role="row">
              <span role="columnheader">{p.compare.rows[0]?.topic ? '\u00a0' : ''}</span>
              <span role="columnheader">{p.compare.leftCol}</span>
              <span role="columnheader">{p.compare.rightCol}</span>
            </div>
            {p.compare.rows.map((row) => (
              <div className="seo-compare-row" role="row" key={row.topic}>
                <strong role="rowheader">{row.topic}</strong>
                <span role="cell" data-label={p.compare.leftCol}>
                  {row.sheets}
                </span>
                <span role="cell" data-label={p.compare.rightCol}>
                  {row.rentelyo}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="seo-band is-tint" aria-labelledby="seo-why">
        <div className="seo-wrap">
          <div className="seo-section-intro">
            <h2 id="seo-why">{p.why.h2}</h2>
          </div>
          <div className="seo-why-grid">
            {p.why.items.map((item) => (
              <article className="lp-card" key={item.title}>
                <h3>{item.title}</h3>
                <p className="muted">{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="seo-band is-surface" aria-labelledby="seo-faq">
        <div className="seo-wrap seo-faq">
          <h2 id="seo-faq">{p.faq.h2}</h2>
          <div className="lp-accordion seo-faq-list">
            {p.faq.items.map((item, i) => (
              <details key={item.q} className="lp-acc-item" open={i === 0}>
                <summary>
                  <h3>{item.q}</h3>
                </summary>
                <p className="muted">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="seo-band is-paper seo-more-band" aria-labelledby="seo-more">
        <div className="seo-wrap">
          <h2 id="seo-more" className="seo-more-title">
            {p.moreLabel}
          </h2>
          <p className="lede seo-crosslink">
            {p.relatedPmsLead}{' '}
            <Link to="/property-management-software-for-landlords">{p.relatedPmsAnchor}</Link>
            {p.relatedPmsTail}{' '}
            {p.relatedSmallLead}{' '}
            <Link to="/property-management-software-for-small-landlords">{p.relatedSmallAnchor}</Link>
            {p.relatedSmallTail}
          </p>
          <nav className="seo-more-links" aria-label={p.moreLabel}>
            <Link to="/features">{t.footer.features}</Link>
            <Link to="/pricing">{t.nav.pricing}</Link>
            <Link to="/security">{t.footer.security}</Link>
          </nav>
        </div>
      </section>

      <section className="seo-band seo-final-band" aria-labelledby="seo-final">
        <div className="seo-wrap">
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
        </div>
      </section>
    </article>
  );
}
