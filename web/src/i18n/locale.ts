export const LOCALES = ['en', 'fr', 'es', 'de', 'pt', 'ar'] as const;

export type Locale = (typeof LOCALES)[number];

export const LOCALE_META: Record<
  Locale,
  { nativeName: string; bcp47: string; dir: 'ltr' | 'rtl' }
> = {
  en: { nativeName: 'English', bcp47: 'en-GB', dir: 'ltr' },
  fr: { nativeName: 'Français', bcp47: 'fr-FR', dir: 'ltr' },
  es: { nativeName: 'Español', bcp47: 'es-ES', dir: 'ltr' },
  de: { nativeName: 'Deutsch', bcp47: 'de-DE', dir: 'ltr' },
  pt: { nativeName: 'Português', bcp47: 'pt-PT', dir: 'ltr' },
  ar: { nativeName: 'العربية', bcp47: 'ar', dir: 'rtl' },
};

export const DEFAULT_COUNTRY: Record<Locale, string> = {
  en: 'CA',
  fr: 'FR',
  es: 'ES',
  de: 'DE',
  pt: 'PT',
  ar: 'TN',
};

export function isLocale(value: string | null | undefined): value is Locale {
  return !!value && (LOCALES as readonly string[]).includes(value);
}

export function detectBrowserLocale(): Locale {
  const tags =
    typeof navigator === 'undefined'
      ? []
      : navigator.languages?.length
        ? [...navigator.languages]
        : navigator.language
          ? [navigator.language]
          : [];
  for (const tag of tags) {
    const base = tag.trim().toLowerCase().split(/[-_]/)[0];
    if (isLocale(base)) return base;
  }
  return 'en';
}

export function applyDocumentLocale(locale: Locale) {
  const meta = LOCALE_META[locale];
  document.documentElement.lang = locale;
  document.documentElement.dir = meta.dir;
  document.documentElement.classList.toggle('is-rtl', meta.dir === 'rtl');
}
