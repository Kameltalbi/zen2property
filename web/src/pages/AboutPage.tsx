import { Link } from 'react-router-dom';
import { useI18n } from '../i18n';

export function AboutPage() {
  const { t } = useI18n();
  return (
    <article className="container legal-page lp-page">
      <p className="kicker">{t.pages.company}</p>
      <h1>{t.pages.aboutTitle}</h1>
      <p className="lede">{t.pages.aboutLede}</p>
      <p className="muted">{t.pages.aboutBody}</p>
      <p style={{ marginTop: 24 }}>
        <Link className="btn clay" to="/signup">
          {t.nav.start}
        </Link>
      </p>
    </article>
  );
}
