import { Link } from 'react-router-dom';
import { useI18n } from '../i18n';

export function AboutPage() {
  const { locale } = useI18n();
  const fr = locale === 'fr';
  return (
    <article className="container legal-page lp-page">
      <p className="kicker">{fr ? 'Entreprise' : 'Company'}</p>
      <h1>{fr ? 'À propos de Rentelyo' : 'About Rentelyo'}</h1>
      <p className="lede">
        {fr
          ? 'Rentelyo est une application de gestion locative pour propriétaires particuliers et investisseurs immobiliers.'
          : 'Rentelyo is a rental management application for individual landlords and property investors.'}
      </p>
      <p className="muted">
        {fr
          ? 'Ce n’est pas une plateforme d’annonces : pas de diffusion de biens, pas de recherche de locataires, pas d’outil d’agence.'
          : 'It is not a listing platform: no property ads, no tenant search, no agency marketplace.'}
      </p>
      <p style={{ marginTop: 24 }}>
        <Link className="btn clay" to="/signup">
          {fr ? 'Créer un compte' : 'Create an account'}
        </Link>
      </p>
    </article>
  );
}
