import { Link } from 'react-router-dom';
import { useI18n } from '../i18n';

export function HelpPage() {
  const { t, locale } = useI18n();
  const faq = t.home.faqHome;
  const fr = locale === 'fr';
  return (
    <article className="container legal-page lp-page">
      <p className="kicker">{fr ? 'Ressources' : 'Resources'}</p>
      <h1>{fr ? 'Centre d’aide' : 'Help centre'}</h1>
      <p className="lede">
        {fr
          ? 'Réponses rapides pour propriétaires et investisseurs utilisant Rentelyo.'
          : 'Quick answers for landlords and investors using Rentelyo.'}
      </p>
      <section id="faq">
        <h2>{faq.title}</h2>
        <div className="lp-accordion">
          {faq.items.map((item) => (
            <details key={item.q} className="lp-acc-item" open>
              <summary>{item.q}</summary>
              <p className="muted">{item.a}</p>
            </details>
          ))}
        </div>
      </section>
      <section id="guides" style={{ marginTop: 32 }}>
        <h2>{fr ? 'Guides pour propriétaires' : 'Guides for landlords'}</h2>
        <p className="muted">
          {fr
            ? 'Parcours recommandé : créer un bien, ajouter un locataire, puis ouvrir une location et suivre les loyers.'
            : 'Recommended path: create a property, add a tenant, then open a lease and track rent.'}
        </p>
        <ul className="lp-bullets">
          <li>
            <Link to="/features">{t.footer.features}</Link>
          </li>
          <li>
            <Link to="/security">{t.footer.security}</Link>
          </li>
          <li>
            <Link to="/signup">{t.footer.signup}</Link>
          </li>
        </ul>
      </section>
    </article>
  );
}
