import { useEffect, useState } from 'react';
import {
  disableAnalytics,
  enableAnalytics,
  OPEN_CONSENT_PREFERENCES_EVENT,
  readConsent,
  saveConsent,
  type ConsentChoice,
} from './analyticsConsent';
import { useI18n } from './i18n';

export function ConsentBanner() {
  const { t } = useI18n();
  const [consent, setConsent] = useState<ConsentChoice | null>(() => readConsent());
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const [analyticsAllowed, setAnalyticsAllowed] = useState(consent?.analytics ?? false);

  useEffect(() => {
    if (consent?.analytics) enableAnalytics();
    else disableAnalytics();
  }, [consent]);

  useEffect(() => {
    function openPreferences() {
      setAnalyticsAllowed(readConsent()?.analytics ?? false);
      setPreferencesOpen(true);
    }
    window.addEventListener(OPEN_CONSENT_PREFERENCES_EVENT, openPreferences);
    return () => window.removeEventListener(OPEN_CONSENT_PREFERENCES_EVENT, openPreferences);
  }, []);

  useEffect(() => {
    if (!preferencesOpen) return;
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key !== 'Escape') return;
      setPreferencesOpen(false);
    }
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [preferencesOpen]);

  function choose(analytics: boolean) {
    const next = saveConsent(analytics);
    setConsent(next);
    setAnalyticsAllowed(analytics);
    setPreferencesOpen(false);
  }

  return (
    <>
      {!consent && !preferencesOpen ? (
        <aside className="consent-banner" aria-labelledby="consent-title" aria-describedby="consent-body">
          <div className="consent-banner-copy">
            <h2 id="consent-title">{t.consent.title}</h2>
            <p id="consent-body">{t.consent.body}</p>
          </div>
          <div className="consent-actions">
            <button className="btn clay" type="button" onClick={() => choose(true)}>
              {t.consent.acceptAll}
            </button>
            <button className="btn secondary" type="button" onClick={() => choose(false)}>
              {t.consent.reject}
            </button>
            <button className="btn ghost" type="button" onClick={() => setPreferencesOpen(true)}>
              {t.consent.manage}
            </button>
          </div>
        </aside>
      ) : null}

      {preferencesOpen ? (
        <div
          className="consent-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="consent-preferences-title"
        >
          <div className="consent-modal-card">
            <div>
              <p className="kicker">{t.consent.kicker}</p>
              <h2 id="consent-preferences-title">{t.consent.preferencesTitle}</h2>
              <p className="muted">{t.consent.preferencesBody}</p>
            </div>

            <div className="consent-option">
              <div>
                <strong>{t.consent.essentialTitle}</strong>
                <p>{t.consent.essentialBody}</p>
              </div>
              <input type="checkbox" checked disabled aria-label={t.consent.essentialAlwaysOn} />
            </div>

            <label className="consent-option">
              <div>
                <strong>{t.consent.analyticsTitle}</strong>
                <p>{t.consent.analyticsBody}</p>
              </div>
              <input
                type="checkbox"
                checked={analyticsAllowed}
                autoFocus
                onChange={(event) => setAnalyticsAllowed(event.target.checked)}
              />
            </label>

            <div className="consent-modal-actions">
              <button className="btn clay" type="button" onClick={() => choose(analyticsAllowed)}>
                {t.consent.save}
              </button>
              <button className="btn secondary" type="button" onClick={() => choose(false)}>
                {t.consent.reject}
              </button>
              <button className="btn ghost" type="button" onClick={() => setPreferencesOpen(false)}>
                {t.nav.close}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
