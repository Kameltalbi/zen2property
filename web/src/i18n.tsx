import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { ar } from './i18n/ar';
import { de } from './i18n/de';
import { en, type Messages } from './i18n/en';
import { es } from './i18n/es';
import { fr } from './i18n/fr';
import {
  applyDocumentLocale,
  detectBrowserLocale,
  isLocale,
  type Locale,
} from './i18n/locale';
import { pt } from './i18n/pt';

export type { Locale, Messages };
export { DEFAULT_COUNTRY, LOCALES, LOCALE_META } from './i18n/locale';

const KEY = 'rentelyo.locale';

const catalogs: Record<Locale, Messages> = { en, fr, es, de, pt, ar };

type I18n = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Messages;
};

const Ctx = createContext<I18n | null>(null);

function readLocale(): Locale {
  try {
    const stored = localStorage.getItem(KEY);
    if (isLocale(stored)) return stored;
  } catch {
    /* ignore */
  }
  return detectBrowserLocale();
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    const next = readLocale();
    if (typeof document !== 'undefined') applyDocumentLocale(next);
    return next;
  });

  useEffect(() => {
    try {
      localStorage.setItem(KEY, locale);
    } catch {
      /* ignore */
    }
    applyDocumentLocale(locale);
  }, [locale]);

  const value = useMemo<I18n>(
    () => ({
      locale,
      setLocale: setLocaleState,
      t: catalogs[locale],
    }),
    [locale],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useI18n(): I18n {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useI18n must be used within LocaleProvider');
  return ctx;
}
