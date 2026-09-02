import { Link } from 'react-router-dom';
import { useI18n } from '../i18n';

export function CookiesPage() {
  const { t } = useI18n();
  return (
    <article className="container legal-page lp-page">
      <p className="kicker">{t.pages.legal}</p>
      <h1>{t.footer.cookies}</h1>
      <p className="muted">{t.pages.cookies1}</p>
      <p className="muted">{t.pages.cookies2}</p>
      <p style={{ marginTop: 20 }}>
        <Link to="/privacy">{t.footer.privacy}</Link>
      </p>
    </article>
  );
}
