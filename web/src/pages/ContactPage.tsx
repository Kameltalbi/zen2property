import { useI18n } from '../i18n';

export function ContactPage() {
  const { t } = useI18n();
  return (
    <article className="container legal-page lp-page">
      <p className="kicker">{t.pages.company}</p>
      <h1>{t.footer.contact}</h1>
      <p className="lede">{t.pages.contactLede}</p>
      <p>
        <a href="mailto:hello@rentelyo.com">hello@rentelyo.com</a>
      </p>
    </article>
  );
}
