import { Link } from 'react-router-dom';
import { useI18n } from '../i18n';

export function SecurityPage() {
  const { t } = useI18n();
  const h = t.home.security;
  return (
    <article className="container legal-page lp-page">
      <p className="kicker">{t.pages.security}</p>
      <h1>{h.title}</h1>
      <p className="lede">{h.lede}</p>
      <ul className="lp-security-list">
        {h.items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <h2>{t.pages.securityMeans}</h2>
      <p className="muted">{t.pages.securityBody}</p>
      <p className="muted">{t.pages.securityBackup}</p>
      <p style={{ marginTop: 24 }}>
        <Link to="/privacy">{t.footer.privacy}</Link>
      </p>
    </article>
  );
}
