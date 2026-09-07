import { useI18n } from '../i18n';
import { openConsentPreferences } from '../analyticsConsent';

export function PrivacyPage() {
  const { t } = useI18n();
  return (
    <article className="container legal-page">
      <p className="kicker">{t.legal.kicker}</p>
      <h1>{t.legal.privacyTitle}</h1>
      <p>{t.legal.privacy1}</p>
      <p>{t.legal.privacy2}</p>
      <p className="muted">{t.legal.privacyNote}</p>
      <p style={{ marginTop: 20 }}>
        <button className="btn secondary" type="button" onClick={openConsentPreferences}>
          {t.footer.cookieSettings}
        </button>
      </p>
    </article>
  );
}
