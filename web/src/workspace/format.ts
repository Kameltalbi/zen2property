import type { Occupancy, PropertyType, Usage } from './types';

export function money(value: number, currency = 'EUR'): string {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency, maximumFractionDigits: 0 }).format(value);
}

export function moneyExact(value: number, currency = 'EUR'): string {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency }).format(value);
}

export function pct(value: number): string {
  return `${value.toFixed(1).replace('.', ',')} %`;
}

export function yieldOf(income: number, value: number): number {
  if (!value) return 0;
  return (income * 12 * 100) / value;
}

export function formatDate(iso: string, locale: 'fr' | 'en' = 'fr'): string {
  return new Intl.DateTimeFormat(locale === 'fr' ? 'fr-FR' : 'en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(`${iso}T12:00:00`));
}

export const typeLabel: Record<PropertyType, { fr: string; en: string }> = {
  apartment: { fr: 'Appartement', en: 'Apartment' },
  house: { fr: 'Maison', en: 'House' },
  studio: { fr: 'Studio', en: 'Studio' },
  other: { fr: 'Autre', en: 'Other' },
};

export const occupancyLabel: Record<Occupancy, { fr: string; en: string }> = {
  rented: { fr: 'Loué', en: 'Rented' },
  vacant: { fr: 'Vacant', en: 'Vacant' },
  personal: { fr: 'Usage perso', en: 'Personal use' },
};

export const usageLabel: Record<Usage, { fr: string; en: string }> = {
  rental: { fr: 'Locatif', en: 'Rental' },
  personal: { fr: 'Personnel', en: 'Personal' },
  mixed: { fr: 'Mixte', en: 'Mixed' },
};
