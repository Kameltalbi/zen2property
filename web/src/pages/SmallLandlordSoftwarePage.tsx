import { Link } from 'react-router-dom';
import { useI18n } from '../i18n';
import { AppScreen } from '../landing/AppScreen';
import { BrowserFrame } from '../landing/BrowserFrame';
import { HomeIcon, type IconName } from '../landing/HomeIcon';

const essentialIcons: IconName[] = ['building', 'users', 'lease', 'coins', 'chart', 'wrench', 'file'];
const chainIcons: IconName[] = ['building', 'users', 'lease', 'coins', 'coins', 'pdf'];
const sideIcons: IconName[] = ['chart', 'wrench', 'file'];

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

export function SmallLandlordSoftwarePage() {
  const { t } = useI18n();
  const p = t.smallLandlord;

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

      <section className="seo-band is-paper" aria-labelledby="seo-problem">
        <div className="seo-wrap">
          <div className="seo-section-intro is-center">
            <h2 id="seo-problem">{p.problem.h2}</h2>
            <p className="lede">{p.problem.body}</p>
          </div>
          <ul className="seo-need-pills">
            {p.problem.needs.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="seo-band is-surface" aria-labelledby="seo-essentials">
        <div className="seo-wrap">
          <div className="seo-section-intro">
            <h2 id="seo-essentials">{p.essentials.h2}</h2>
            <p className="lede">{p.essentials.lede}</p>
          </div>
          <div className="seo-essentials">
            {p.essentials.cards.map((card, i) => (
              <article key={card.title}>
                <span className="seo-essentials-icon" aria-hidden>
                  <HomeIcon name={essentialIcons[i] ?? 'building'} />
                </span>
                <h3>{card.title}</h3>
                <p>{card.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="seo-band is-tint" aria-labelledby="seo-chain">
        <div className="seo-wrap">
          <div className="seo-section-intro">
            <h2 id="seo-chain">{p.chain.h2}</h2>
            <p className="lede">{p.chain.lede}</p>
          </div>
          <div className="seo-chain">
            <ol className="seo-chain-main">
              {p.chain.steps.map((step, i) => (
                <li key={step.title}>
                  {i !== 0 ? <span className="seo-chain-arrow" aria-hidden /> : null}
                  <div className="seo-chain-card">
                    <span className="seo-flow-icon" aria-hidden>
                      <HomeIcon name={chainIcons[i] ?? 'building'} />
                    </span>
                    <div>
                      <p className="seo-flow-label">{step.title}</p>
                      <p>{step.body}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
            <aside className="seo-chain-side">
              <p className="seo-chain-side-title">{p.chain.sideTitle}</p>
              {p.chain.side.map((item, i) => (
                <article key={item.title}>
                  <span className="seo-essentials-icon" aria-hidden>
                    <HomeIcon name={sideIcons[i] ?? 'file'} />
                  </span>
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.body}</p>
                  </div>
                </article>
              ))}
            </aside>
          </div>
        </div>
      </section>

      <section className="seo-band is-paper" aria-labelledby="seo-rent">
        <div className="seo-wrap seo-split">
          <div className="seo-split-copy">
            <h2 id="seo-rent">{p.rent.h2}</h2>
            <p className="lede">{p.rent.body}</p>
            <ul className="lp-bullets">
              {p.rent.points.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="seo-split-visual">
            <BrowserFrame title="app.rentelyo.com" className="seo-product-frame">
              <AppScreen screen="rent" />
            </BrowserFrame>
          </div>
        </div>
      </section>

      <section className="seo-band is-surface" aria-labelledby="seo-leases">
        <div className="seo-wrap seo-split is-reverse">
          <div className="seo-split-copy">
            <h2 id="seo-leases">{p.leases.h2}</h2>
            <p className="lede">{p.leases.body}</p>
            <ul className="lp-bullets">
              {p.leases.points.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="seo-split-visual">
            <BrowserFrame title="app.rentelyo.com" flush className="seo-product-frame">
              <img
                src="/capture-lease.jpg"
                alt={p.leases.h2}
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

      <section className="seo-band is-paper" aria-labelledby="seo-docs">
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

      <section className="seo-band is-surface" aria-labelledby="seo-dash">
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

      <section className="seo-band is-paper" aria-labelledby="seo-fit">
        <div className="seo-wrap">
          <div className="seo-section-intro is-center">
            <h2 id="seo-fit">{p.fit.h2}</h2>
            <p className="lede">{p.fit.body}</p>
          </div>
          <div className="seo-fit">
            <article className="seo-fit-col is-left">
              <h3>{p.fit.leftTitle}</h3>
              <ul>
                {p.fit.left.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
            <article className="seo-fit-col is-right">
              <h3>{p.fit.rightTitle}</h3>
              <ul>
                {p.fit.right.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          </div>
        </div>
      </section>

      <section className="seo-band is-tint" aria-labelledby="seo-grow">
        <div className="seo-wrap">
          <div className="seo-grow">
            <div>
              <h2 id="seo-grow">{p.grow.h2}</h2>
              <p className="lede">{p.grow.body}</p>
              <p className="seo-grow-plan">{p.grow.plan}</p>
            </div>
            <Link className="btn clay" to="/pricing">
              {p.grow.cta}
            </Link>
          </div>
        </div>
      </section>

      <section className="seo-band is-surface" aria-labelledby="seo-why">
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

      <section className="seo-band is-paper" aria-labelledby="seo-faq">
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

      <section className="seo-band is-surface seo-more-band" aria-labelledby="seo-more">
        <div className="seo-wrap">
          <h2 id="seo-more" className="seo-more-title">
            {p.moreLabel}
          </h2>
          <p className="lede seo-crosslink">
            {p.relatedPmsLead}{' '}
            <Link to="/property-management-software-for-landlords">{p.relatedPmsAnchor}</Link>
            {p.relatedPmsTail}{' '}
            {p.relatedSimpleLead}{' '}
            <Link to="/landlord-software">{p.relatedSimpleAnchor}</Link>
            {p.relatedSimpleTail}
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
