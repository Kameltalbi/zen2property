import Stripe from 'stripe';
import { env, stripePriceIdFromEnv } from '../../config/env';

let client: Stripe | null = null;

export function getStripe(): Stripe {
  if (!env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not configured');
  }
  if (!client) {
    client = new Stripe(env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-02-24.acacia',
      typescript: true,
    });
  }
  return client;
}

const PRICE_ENV_KEYS = [
  'STRIPE_PRICE_SMART_MONTHLY_CAD',
  'STRIPE_PRICE_SMART_YEARLY_CAD',
  'STRIPE_PRICE_PREMIUM_MONTHLY_CAD',
  'STRIPE_PRICE_PREMIUM_YEARLY_CAD',
  'STRIPE_PRICE_SMART_MONTHLY_USD',
  'STRIPE_PRICE_SMART_YEARLY_USD',
  'STRIPE_PRICE_PREMIUM_MONTHLY_USD',
  'STRIPE_PRICE_PREMIUM_YEARLY_USD',
  'STRIPE_PRICE_SMART_MONTHLY_EUR',
  'STRIPE_PRICE_SMART_YEARLY_EUR',
  'STRIPE_PRICE_PREMIUM_MONTHLY_EUR',
  'STRIPE_PRICE_PREMIUM_YEARLY_EUR',
] as const;

/** Server-side whitelist — never trust a priceId from the client. */
export function isWhitelistedPriceId(priceId: string): boolean {
  if (!priceId) return false;
  return PRICE_ENV_KEYS.some((key) => stripePriceIdFromEnv(key) === priceId);
}

export function allConfiguredPriceIds(): string[] {
  return PRICE_ENV_KEYS.map((key) => stripePriceIdFromEnv(key)).filter(Boolean);
}
