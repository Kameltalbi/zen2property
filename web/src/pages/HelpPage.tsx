import { Link } from 'react-router-dom';
import { useI18n } from '../i18n';

export function HelpPage() {
  const { t } = useI18n();
  const faq = t.home.faqHome;
  return (
    <article className="container legal-page lp-page">
      <p className="kicker">{t.pages.resources}</p>
      <h1>{t.pages.helpTitle}</h1>
      <p className="lede">{t.pages.helpLede}</p>
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
        <h2>{t.pages.guidesTitle}</h2>
        <p className="muted">{t.pages.guidesBody}</p>
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
