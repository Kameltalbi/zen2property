import { useI18n } from '../i18n';

export function TermsPage() {
  const { t } = useI18n();
  return (
    <article className="container legal-page">
      <p className="kicker">{t.legal.kicker}</p>
      <h1>{t.legal.termsTitle}</h1>
      <p>{t.legal.terms1}</p>
      <p>{t.legal.terms2}</p>
      <p className="muted">{t.legal.termsNote}</p>
    </article>
  );
}
