import { useEffect, useState } from 'react';
import { api } from '../api';
import { ISO_COUNTRIES } from '../../../src/data/isoCountries';
import type { Locale } from '../i18n';

export type CountryOption = { code: string; name: string };

export const FALLBACK_COUNTRIES: CountryOption[] = ISO_COUNTRIES.map(({ code, name }) => ({ code, name }));

export function countryLabel(code: string, locale: Locale): string {
  try {
    return new Intl.DisplayNames([locale === 'fr' ? 'fr' : 'en'], { type: 'region' }).of(code) ?? code;
  } catch {
    return code;
  }
}

export function useCountries() {
  const [countries, setCountries] = useState<CountryOption[]>(FALLBACK_COUNTRIES);

  useEffect(() => {
    void api<{ countries: CountryOption[] }>('/legal/countries')
      .then((data) => {
        if (data.countries.length) setCountries(data.countries);
      })
      .catch(() => undefined);
  }, []);

  return countries;
}
