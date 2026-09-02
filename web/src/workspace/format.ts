import type { Occupancy, PropertyType, Usage } from './types';
import { LOCALE_META, type Locale } from '../i18n/locale';

export function money(value: number, currency = 'EUR', locale: Locale = 'fr'): string {
  return new Intl.NumberFormat(LOCALE_META[locale].bcp47, { style: 'currency', currency, maximumFractionDigits: 0 }).format(value);
}

export function moneyExact(value: number, currency = 'EUR', locale: Locale = 'fr'): string {
  return new Intl.NumberFormat(LOCALE_META[locale].bcp47, { style: 'currency', currency }).format(value);
}

export function pct(value: number): string {
  return `${value.toFixed(1).replace('.', ',')} %`;
}

export function yieldOf(income: number, value: number): number {
  if (!value) return 0;
  return (income * 12 * 100) / value;
}

export function formatDate(iso: string, locale: Locale = 'fr'): string {
  return new Intl.DateTimeFormat(LOCALE_META[locale].bcp47, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(`${iso}T12:00:00`));
}

const L = (en: string, fr: string, es: string, de: string, pt: string, ar: string): Record<Locale, string> => ({
  en, fr, es, de, pt, ar,
});

export const typeLabel: Record<PropertyType, Record<Locale, string>> = {
  apartment: L('Apartment', 'Appartement', 'Piso', 'Wohnung', 'Apartamento', 'شقة'),
  house: L('House', 'Maison', 'Casa', 'Haus', 'Moradia', 'منزل'),
  studio: L('Studio', 'Studio', 'Estudio', 'Studio', 'Estúdio', 'ستوديو'),
  other: L('Other', 'Autre', 'Otro', 'Sonstiges', 'Outro', 'أخرى'),
};

export const occupancyLabel: Record<Occupancy, Record<Locale, string>> = {
  rented: L('Rented', 'Loué', 'Alquilado', 'Vermietet', 'Arrendado', 'مؤجر'),
  vacant: L('Vacant', 'Vacant', 'Libre', 'Frei', 'Livre', 'شاغر'),
  personal: L('Personal use', 'Usage perso', 'Uso propio', 'Eigennutzung', 'Uso pessoal', 'استخدام شخصي'),
};

export const usageLabel: Record<Usage, Record<Locale, string>> = {
  rental: L('Rental', 'Locatif', 'Alquiler', 'Vermietung', 'Arrendamento', 'إيجار'),
  personal: L('Personal', 'Personnel', 'Personal', 'Privat', 'Pessoal', 'شخصي'),
  mixed: L('Mixed', 'Mixte', 'Mixto', 'Gemischt', 'Misto', 'مختلط'),
};
