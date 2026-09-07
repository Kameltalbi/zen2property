export const GA_MEASUREMENT_ID = 'G-EK2S7GSCS0';
export const CONSENT_STORAGE_KEY = 'rentelyo.cookie-consent.v1';
export const OPEN_CONSENT_PREFERENCES_EVENT = 'rentelyo:open-consent-preferences';

export type ConsentChoice = {
  essential: true;
  analytics: boolean;
  updatedAt: string;
};

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    [key: `ga-disable-${string}`]: boolean | undefined;
  }
}

let analyticsStarted = false;

export function readConsent(): ConsentChoice | null {
  try {
    const raw = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<ConsentChoice>;
    if (parsed.essential !== true || typeof parsed.analytics !== 'boolean') return null;
    return {
      essential: true,
      analytics: parsed.analytics,
      updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : '',
    };
  } catch {
    return null;
  }
}

export function saveConsent(analytics: boolean): ConsentChoice {
  const choice: ConsentChoice = {
    essential: true,
    analytics,
    updatedAt: new Date().toISOString(),
  };
  try {
    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(choice));
  } catch {
    // Consent still applies for the current page if storage is unavailable.
  }
  return choice;
}

function ensureGtag() {
  window.dataLayer = window.dataLayer || [];
  window.gtag =
    window.gtag ||
    function gtag(..._args: unknown[]) {
      window.dataLayer?.push(arguments);
    };
}

export function enableAnalytics() {
  window[`ga-disable-${GA_MEASUREMENT_ID}`] = false;
  if (analyticsStarted || document.getElementById('rentelyo-ga4')) return;

  ensureGtag();
  window.gtag?.('js', new Date());
  window.gtag?.('config', GA_MEASUREMENT_ID);

  const script = document.createElement('script');
  script.id = 'rentelyo-ga4';
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);
  analyticsStarted = true;
}

function expireCookie(name: string, domain?: string) {
  const domainPart = domain ? `; Domain=${domain}` : '';
  document.cookie = `${name}=; Max-Age=0; Path=/${domainPart}; SameSite=Lax`;
}

function clearAnalyticsCookies() {
  const names = document.cookie
    .split(';')
    .map((item) => item.trim().split('=')[0] ?? '')
    .filter((name) => name === '_ga' || name === '_gid' || name === '_gat' || name.startsWith('_ga_'));
  const hostname = window.location.hostname;
  const parentDomain = hostname.split('.').length > 1 ? `.${hostname.split('.').slice(-2).join('.')}` : '';

  for (const name of names) {
    expireCookie(name);
    expireCookie(name, hostname);
    if (parentDomain) expireCookie(name, parentDomain);
  }
}

export function disableAnalytics() {
  window[`ga-disable-${GA_MEASUREMENT_ID}`] = true;
  window.gtag?.('consent', 'update', { analytics_storage: 'denied' });
  document.getElementById('rentelyo-ga4')?.remove();
  clearAnalyticsCookies();
  analyticsStarted = false;
}

export function openConsentPreferences() {
  window.dispatchEvent(new Event(OPEN_CONSENT_PREFERENCES_EVENT));
}
