/** Centralized SaaS pricing markets. Amounts are always in the currency's minor unit. */

export type PricingMarketId = 'CA' | 'US' | 'EU' | 'TN' | 'OTHER';
export type PaidPlanCode = 'premium' | 'pro';
export type BillingPeriod = 'monthly' | 'yearly';
export type PlanCode = 'free' | PaidPlanCode;

export type PlanLimits = {
  maxProperties: number;
  maxUsers: number;
  maxTenants: number | null;
};

export const PLAN_LIMITS: Record<PlanCode, PlanLimits> = {
  free: { maxProperties: 1, maxUsers: 1, maxTenants: 1 },
  premium: { maxProperties: 10, maxUsers: 3, maxTenants: null },
  pro: { maxProperties: 50, maxUsers: 10, maxTenants: null },
};

/** DB / API plan enum (FREE | PREMIUM | PRO). */
export type PlanId = 'FREE' | 'PREMIUM' | 'PRO';

export function planCodeFromId(id: string): PlanCode {
  if (id === 'PREMIUM' || id === 'INVESTOR') return 'premium';
  if (id === 'PRO') return 'pro';
  return 'free';
}

export function planIdFromCode(code: PlanCode): PlanId {
  if (code === 'premium') return 'PREMIUM';
  if (code === 'pro') return 'PRO';
  return 'FREE';
}

type PaidAmounts = {
  monthly: number;
  yearly: number;
};

type MarketConfig = {
  id: PricingMarketId;
  /** Currency shown on the pricing page. */
  displayCurrency: string;
  /** Currency actually charged by Stripe (may differ for TN). */
  chargeCurrency: string;
  /** Intl locale for NumberFormat. */
  locale: string;
  /** Whether charge currency differs from display — must be disclosed before Checkout. */
  chargeDiffersFromDisplay: boolean;
  plans: {
    free: { monthly: 0; yearly: 0 };
    premium: PaidAmounts;
    pro: PaidAmounts;
  };
};

const EURO_COUNTRIES = new Set([
  'AT', 'BE', 'CY', 'DE', 'EE', 'ES', 'FI', 'FR', 'GR', 'HR', 'IE', 'IT', 'LT', 'LU', 'LV', 'MT', 'NL', 'PT', 'SI', 'SK',
  'AD', 'MC', 'SM', 'VA', 'ME', 'XK',
]);

export const PRICING_MARKETS: Record<PricingMarketId, MarketConfig> = {
  CA: {
    id: 'CA',
    displayCurrency: 'CAD',
    chargeCurrency: 'CAD',
    locale: 'fr-CA',
    chargeDiffersFromDisplay: false,
    plans: {
      free: { monthly: 0, yearly: 0 },
      premium: { monthly: 1499, yearly: 14900 },
      pro: { monthly: 2999, yearly: 29900 },
    },
  },
  US: {
    id: 'US',
    displayCurrency: 'USD',
    chargeCurrency: 'USD',
    locale: 'en-US',
    chargeDiffersFromDisplay: false,
    plans: {
      free: { monthly: 0, yearly: 0 },
      premium: { monthly: 999, yearly: 9900 },
      pro: { monthly: 1999, yearly: 19900 },
    },
  },
  EU: {
    id: 'EU',
    displayCurrency: 'EUR',
    chargeCurrency: 'EUR',
    locale: 'fr-FR',
    chargeDiffersFromDisplay: false,
    plans: {
      free: { monthly: 0, yearly: 0 },
      premium: { monthly: 990, yearly: 9900 },
      pro: { monthly: 1990, yearly: 19900 },
    },
  },
  /**
   * Tunisia: Stripe does not support TND. Show and charge USD (same list as US).
   */
  TN: {
    id: 'TN',
    displayCurrency: 'USD',
    chargeCurrency: 'USD',
    locale: 'en-US',
    chargeDiffersFromDisplay: false,
    plans: {
      free: { monthly: 0, yearly: 0 },
      premium: { monthly: 999, yearly: 9900 },
      pro: { monthly: 1999, yearly: 19900 },
    },
  },
  OTHER: {
    id: 'OTHER',
    displayCurrency: 'USD',
    chargeCurrency: 'USD',
    locale: 'en-US',
    chargeDiffersFromDisplay: false,
    plans: {
      free: { monthly: 0, yearly: 0 },
      premium: { monthly: 999, yearly: 9900 },
      pro: { monthly: 1999, yearly: 19900 },
    },
  },
};

export function resolvePricingMarket(countryCode: string | null | undefined): MarketConfig {
  const code = (countryCode ?? '').trim().toUpperCase();
  if (!code) return PRICING_MARKETS.OTHER;
  if (code === 'CA') return PRICING_MARKETS.CA;
  if (code === 'US') return PRICING_MARKETS.US;
  if (code === 'TN') return PRICING_MARKETS.TN;
  if (code === 'EU' || EURO_COUNTRIES.has(code)) return PRICING_MARKETS.EU;
  return PRICING_MARKETS.OTHER;
}

export function formatMinorUnit(
  amountMinor: number,
  currency: string,
  locale: string,
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: amountMinor % 100 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amountMinor / 100);
}

export type ResolvedStripePrice = {
  market: PricingMarketId;
  displayCurrency: string;
  chargeCurrency: string;
  chargeDiffersFromDisplay: boolean;
  planCode: PaidPlanCode;
  billingPeriod: BillingPeriod;
  displayAmountMinor: number;
  chargeAmountMinor: number;
  /** Env key used to look up the Stripe Price id. */
  envKey: string;
};

export function stripePriceEnvKey(
  plan: PaidPlanCode,
  period: BillingPeriod,
  chargeCurrency: string,
): string {
  const planPart = plan.toUpperCase();
  const periodPart = period === 'monthly' ? 'MONTHLY' : 'YEARLY';
  const cur = chargeCurrency.toUpperCase();
  return `STRIPE_PRICE_${planPart}_${periodPart}_${cur}`;
}

export function resolveCheckoutPrice(
  countryCode: string,
  planCode: PaidPlanCode,
  billingPeriod: BillingPeriod,
): ResolvedStripePrice {
  const market = resolvePricingMarket(countryCode);
  const amountMinor = market.plans[planCode][billingPeriod === 'monthly' ? 'monthly' : 'yearly'];

  return {
    market: market.id,
    displayCurrency: market.displayCurrency,
    chargeCurrency: market.chargeCurrency,
    chargeDiffersFromDisplay: market.chargeDiffersFromDisplay,
    planCode,
    billingPeriod,
    displayAmountMinor: amountMinor,
    chargeAmountMinor: amountMinor,
    envKey: stripePriceEnvKey(planCode, billingPeriod, market.chargeCurrency),
  };
}

/** Countries offered in the billing country selector (pricing page / signup). */
export const BILLING_COUNTRY_OPTIONS: Array<{ code: string; market: PricingMarketId }> = [
  { code: 'CA', market: 'CA' },
  { code: 'US', market: 'US' },
  { code: 'FR', market: 'EU' },
  { code: 'BE', market: 'EU' },
  { code: 'DE', market: 'EU' },
  { code: 'ES', market: 'EU' },
  { code: 'IT', market: 'EU' },
  { code: 'NL', market: 'EU' },
  { code: 'PT', market: 'EU' },
  { code: 'IE', market: 'EU' },
  { code: 'AT', market: 'EU' },
  { code: 'TN', market: 'TN' },
];

export const CANADIAN_PROVINCES = [
  'AB', 'BC', 'MB', 'NB', 'NL', 'NS', 'NT', 'NU', 'ON', 'PE', 'QC', 'SK', 'YT',
] as const;
