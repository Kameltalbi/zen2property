const KEY = 'rentelyo.billingCountry';

export function readStoredBillingCountry(): string | null {
  try {
    const v = localStorage.getItem(KEY);
    return v && /^[A-Z]{2}$/.test(v) ? v : null;
  } catch {
    return null;
  }
}

export function storeBillingCountry(code: string): void {
  try {
    localStorage.setItem(KEY, code.toUpperCase());
  } catch {
    /* ignore */
  }
}

/** Soft suggestion only — never overrides an explicit choice. */
export function detectSuggestedCountry(): string | null {
  try {
    const lang = navigator.language || '';
    if (/^fr-ca/i.test(lang) || /^en-ca/i.test(lang)) return 'CA';
    if (/^en-us/i.test(lang)) return 'US';
    if (/^fr/i.test(lang)) return 'FR';
    if (/^de/i.test(lang)) return 'DE';
    if (/^es/i.test(lang)) return 'ES';
    if (/^it/i.test(lang)) return 'IT';
    if (/^nl/i.test(lang)) return 'NL';
    if (/^ar-tn|fr-tn/i.test(lang)) return 'TN';

    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    if (tz.startsWith('America/Toronto') || tz.startsWith('America/Vancouver') || tz.startsWith('America/Montreal')) {
      return 'CA';
    }
    if (tz.startsWith('America/New_York') || tz.startsWith('America/Chicago') || tz.startsWith('America/Los_Angeles')) {
      return 'US';
    }
    if (tz.startsWith('Africa/Tunis')) return 'TN';
    if (tz.startsWith('Europe/')) return 'FR';
  } catch {
    /* ignore */
  }
  return null;
}
