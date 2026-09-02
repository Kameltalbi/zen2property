import { useI18n } from '../i18n';

export function ContactPage() {
  const { locale } = useI18n();
  const fr = locale === 'fr';
  return (
    <article className="container legal-page lp-page">
      <p className="kicker">{fr ? 'Entreprise' : 'Company'}</p>
      <h1>{fr ? 'Contact' : 'Contact'}</h1>
      <p className="lede">
        {fr
          ? 'Une question sur votre compte ou votre portefeuille ? Écrivez-nous.'
          : 'A question about your account or portfolio? Write to us.'}
      </p>
      <p>
        <a href="mailto:hello@rentelyo.com">hello@rentelyo.com</a>
      </p>
    </article>
  );
}
