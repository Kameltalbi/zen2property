import { Link } from 'react-router-dom';
import { useI18n } from '../i18n';

export function SecurityPage() {
  const { t, locale } = useI18n();
  const h = t.home.security;
  const fr = locale === 'fr';
  return (
    <article className="container legal-page lp-page">
      <p className="kicker">{fr ? 'Sécurité' : 'Security'}</p>
      <h1>{h.title}</h1>
      <p className="lede">{h.lede}</p>
      <ul className="lp-security-list">
        {h.items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <h2>{fr ? 'Ce que cela signifie' : 'What this means'}</h2>
      <p className="muted">
        {fr
          ? 'La connexion utilise un mot de passe chiffré (bcrypt) et des sessions JWT. Les données de chaque compte sont isolées côté serveur. En production, les échanges passent en HTTPS. Nous ne vendons pas vos fiches propriétaires ou locataires.'
          : 'Sign-in uses hashed passwords (bcrypt) and JWT sessions. Each account’s data is isolated on the server. In production, traffic uses HTTPS. We do not sell landlord or tenant records.'}
      </p>
      <p className="muted">
        {fr
          ? 'Les sauvegardes d’infrastructure dépendent de votre hébergement ; elles ne sont pas un module productisé dans l’application.'
          : 'Infrastructure backups depend on your hosting; they are not a productised in-app feature.'}
      </p>
      <p style={{ marginTop: 24 }}>
        <Link to="/privacy">{t.footer.privacy}</Link>
      </p>
    </article>
  );
}
