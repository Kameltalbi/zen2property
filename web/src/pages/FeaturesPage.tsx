import { Link } from 'react-router-dom';
import { useI18n } from '../i18n';

export function FeaturesPage() {
  const { t, locale } = useI18n();
  const h = t.home;
  const fr = locale === 'fr';
  return (
    <article className="container legal-page lp-page">
      <p className="kicker">{fr ? 'Produit' : 'Product'}</p>
      <h1>{h.features.title}</h1>
      <p className="lede">{h.organize.body}</p>
      <div className="lp-card-grid three" style={{ marginTop: 28 }}>
        {h.features.items.map((item) => (
          <article className="lp-card" key={item.title}>
            <h3>{item.title}</h3>
            <p className="muted">{item.body}</p>
          </article>
        ))}
      </div>
      <section id="documents" className="lp-page-block">
        <h2>{h.documents.title}</h2>
        <p className="muted">{h.documents.body}</p>
      </section>
      <p style={{ marginTop: 28 }}>
        <Link className="btn clay" to="/signup">
          {h.finalCta.primary}
        </Link>
      </p>
    </article>
  );
}
