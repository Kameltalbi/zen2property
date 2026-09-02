import { Link } from 'react-router-dom';
import { useI18n } from '../i18n';

export function CookiesPage() {
  const { t, locale } = useI18n();
  const fr = locale === 'fr';
  return (
    <article className="container legal-page lp-page">
      <p className="kicker">{fr ? 'Légal' : 'Legal'}</p>
      <h1>{t.footer.cookies}</h1>
      <p className="muted">
        {fr
          ? 'Rentelyo utilise le stockage local du navigateur pour la session (jeton d’authentification) et la préférence de langue. Ces éléments sont nécessaires au fonctionnement du service.'
          : 'Rentelyo uses browser local storage for the session (auth token) and language preference. These are required for the service to work.'}
      </p>
      <p className="muted">
        {fr
          ? 'Aucun cookie publicitaire tiers n’est déployé par l’application elle-même.'
          : 'No third-party advertising cookies are deployed by the application itself.'}
      </p>
      <p style={{ marginTop: 20 }}>
        <Link to="/privacy">{t.footer.privacy}</Link>
      </p>
    </article>
  );
}
