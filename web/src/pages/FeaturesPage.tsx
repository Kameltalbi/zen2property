import { Link } from 'react-router-dom';
import { useI18n } from '../i18n';

export function FeaturesPage() {
  const { t, locale } = useI18n();
  const h = t.home;
  return (
    <article className="container legal-page lp-page">
      <p className="kicker">{locale === 'fr' ? 'Produit' : 'Product'}</p>
      <h1>{h.featureGrid.title}</h1>
      <p className="lede">{h.featureGrid.lede}</p>
      <section id="dashboard" className="lp-page-block">
        <h2>{h.dashboard.title}</h2>
        <p className="muted">{h.dashboard.lede}</p>
        <ul className="lp-bullets">
          {h.dashboard.highlights.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
      <div className="lp-card-grid three" style={{ marginTop: 28 }}>
        {h.featureGrid.items.map((item) => (
          <article className="lp-card" key={item.title}>
            <h3>{item.title}</h3>
            <p className="muted">{item.body}</p>
          </article>
        ))}
      </div>
      <p style={{ marginTop: 28 }}>
        <Link className="btn clay" to="/signup">
          {h.finalCta.primary}
        </Link>
      </p>
    </article>
  );
}
