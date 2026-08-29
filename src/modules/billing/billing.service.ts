import { z } from 'zod';
import { env, stripePriceIdFromEnv } from '../../config/env';
import { query, queryOne } from '../../db/pool';
import { HttpError } from '../../lib/httpError';
import { planOf, type PlanId } from './plans';
import {
  formatMinorUnit,
  resolveCheckoutPrice,
  resolvePricingMarket,
  type BillingPeriod,
  type PaidPlanCode,
  type PricingMarketId,
} from './pricingMarkets';

export const checkoutSchema = z.object({
  plan: z.enum(['premium', 'pro']),
  billingPeriod: z.enum(['monthly', 'yearly']),
});

export const mockSubscribeSchema = z.object({
  plan: z.enum(['FREE', 'PREMIUM', 'PRO', 'INVESTOR']),
});

export const pricingQuoteSchema = z.object({
  countryCode: z.string().length(2).optional(),
});

function catalogForMarket(countryCode: string) {
  const market = resolvePricingMarket(countryCode);
  const plans = (['free', 'premium', 'pro'] as const).map((code) => {
    const amounts = market.plans[code];
    const base = planOf(code === 'free' ? 'FREE' : code === 'premium' ? 'PREMIUM' : 'PRO');
    return {
      id: base.id,
      code,
      name: base.name,
      tagline: base.tagline,
      popular: base.popular,
      maxProperties: base.maxProperties,
      maxUsers: base.maxUsers,
      maxTenants: base.maxTenants,
      monthlyMinor: amounts.monthly,
      yearlyMinor: amounts.yearly,
      monthlyFormatted: formatMinorUnit(amounts.monthly, market.displayCurrency, market.locale),
      yearlyFormatted: formatMinorUnit(amounts.yearly, market.displayCurrency, market.locale),
    };
  });

  return {
    countryCode: countryCode.toUpperCase(),
    market: market.id,
    displayCurrency: market.displayCurrency,
    chargeCurrency: market.chargeCurrency,
    chargeDiffersFromDisplay: market.chargeDiffersFromDisplay,
    locale: market.locale,
    taxNote: true,
    plans,
  };
}

export function listPlansForCountry(countryCode: string) {
  return catalogForMarket(countryCode);
}

/** Public catalog (legacy shape + localized). */
export function listPlans() {
  return catalogForMarket('CA');
}

export async function getBilling(userId: string) {
  const user = await queryOne<{
    plan: PlanId;
    stripe_customer_id: string | null;
    billing_country_code: string | null;
    country_code: string;
    pricing_market: string | null;
    preferred_currency: string | null;
    subscription_status: string;
  }>(
    `SELECT plan, stripe_customer_id, billing_country_code, country_code, pricing_market,
            preferred_currency, subscription_status
     FROM users WHERE id = $1`,
    [userId],
  );
  if (!user) throw new HttpError(404, 'User not found');
  const country = (user.billing_country_code ?? user.country_code).trim();
  return {
    plan: planOf(user.plan),
    subscriptionStatus: user.subscription_status,
    stripeCustomerId: user.stripe_customer_id,
    billingCountryCode: country,
    pricingMarket: user.pricing_market ?? resolvePricingMarket(country).id,
    preferredCurrency: user.preferred_currency ?? resolvePricingMarket(country).displayCurrency,
    mockMode: !env.STRIPE_SECRET_KEY,
    catalog: catalogForMarket(country),
  };
}

function assertNoActiveSubscriptionConflict(status: string) {
  if (status === 'active' || status === 'trialing' || status === 'past_due') {
    throw new HttpError(409, 'An active subscription already exists for this account');
  }
}

export async function createCheckout(
  userId: string,
  planCode: PaidPlanCode,
  billingPeriod: BillingPeriod,
) {
  const user = await queryOne<{
    email: string;
    plan: PlanId;
    subscription_status: string;
    stripe_customer_id: string | null;
    billing_country_code: string | null;
    country_code: string;
  }>(
    `SELECT email, plan, subscription_status, stripe_customer_id, billing_country_code, country_code
     FROM users WHERE id = $1`,
    [userId],
  );
  if (!user) throw new HttpError(404, 'User not found');
  assertNoActiveSubscriptionConflict(user.subscription_status);

  const country = (user.billing_country_code ?? user.country_code).trim().toUpperCase();
  const resolved = resolveCheckoutPrice(country, planCode, billingPeriod);
  const priceId = stripePriceIdFromEnv(resolved.envKey);

  if (!env.STRIPE_SECRET_KEY) {
    return {
      mock: true as const,
      message: 'Stripe is not configured. In development, use mock-subscribe after confirming the plan.',
      plan: planCode,
      billingPeriod,
      pricingMarket: resolved.market,
      displayCurrency: resolved.displayCurrency,
      chargeCurrency: resolved.chargeCurrency,
      chargeDiffersFromDisplay: resolved.chargeDiffersFromDisplay,
      displayAmountMinor: resolved.displayAmountMinor,
      chargeAmountMinor: resolved.chargeAmountMinor,
      checkoutUrl: null,
    };
  }

  if (!priceId) {
    throw new HttpError(500, `Missing Stripe price id for ${resolved.envKey}`);
  }

  const { getStripe, isWhitelistedPriceId } = await import('./stripeClient');
  if (!isWhitelistedPriceId(priceId)) {
    throw new HttpError(500, 'Configured Stripe price id is not on the server whitelist');
  }

  const stripe = getStripe();
  let customerId = user.stripe_customer_id;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { userId },
    });
    customerId = customer.id;
    await queryOne(
      `UPDATE users SET stripe_customer_id = $2, updated_at = now() WHERE id = $1 RETURNING id`,
      [userId, customerId],
    );
  }

  const metadata = {
    userId,
    planCode,
    billingPeriod,
    pricingMarket: resolved.market,
    countryCode: country,
    currency: resolved.chargeCurrency.toLowerCase(),
  };

  const sessionParams: import('stripe').Stripe.Checkout.SessionCreateParams = {
    mode: 'subscription',
    customer: customerId,
    client_reference_id: userId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${env.APP_ORIGIN}/pricing?checkout=success`,
    cancel_url: `${env.APP_ORIGIN}/pricing?checkout=cancel`,
    billing_address_collection: 'required',
    customer_update: { address: 'auto', name: 'auto' },
    metadata,
    subscription_data: {
      metadata,
    },
    allow_promotion_codes: true,
  };

  if (env.STRIPE_TAX_ENABLED) {
    sessionParams.automatic_tax = { enabled: true };
  }

  const session = await stripe.checkout.sessions.create(sessionParams);
  if (!session.url) {
    throw new HttpError(500, 'Stripe Checkout session was created without a URL');
  }

  return {
    mock: false as const,
    checkoutUrl: session.url,
    sessionId: session.id,
    plan: planCode,
    billingPeriod,
    pricingMarket: resolved.market,
    displayCurrency: resolved.displayCurrency,
    chargeCurrency: resolved.chargeCurrency,
    chargeDiffersFromDisplay: resolved.chargeDiffersFromDisplay,
    displayAmountMinor: resolved.displayAmountMinor,
    chargeAmountMinor: resolved.chargeAmountMinor,
  };
}

export async function mockSubscribe(userId: string, planRaw: string) {
  if (env.NODE_ENV === 'production') {
    throw new HttpError(403, 'Mock billing is disabled in production');
  }
  const planId = (planRaw === 'INVESTOR' ? 'PREMIUM' : planRaw) as PlanId;
  if (!['FREE', 'PREMIUM', 'PRO'].includes(planId)) {
    throw new HttpError(400, 'Invalid plan');
  }
  const status = planId === 'FREE' ? 'none' : 'active';
  const user = await queryOne<{ plan: PlanId }>(
    'UPDATE users SET plan = $2, subscription_status = $3, updated_at = now() WHERE id = $1 RETURNING plan',
    [userId, planId, status],
  );
  if (!user) throw new HttpError(404, 'User not found');
  return { plan: planOf(user.plan) };
}

export async function updateBillingCountry(
  userId: string,
  input: {
    billingCountryCode: string;
    billingRegion?: string | null;
    confirmCurrencyChange?: boolean;
  },
) {
  const user = await queryOne<{
    subscription_status: string;
    billing_country_code: string | null;
    country_code: string;
    preferred_currency: string | null;
  }>(
    `SELECT subscription_status, billing_country_code, country_code, preferred_currency
     FROM users WHERE id = $1`,
    [userId],
  );
  if (!user) throw new HttpError(404, 'User not found');

  const nextCountry = input.billingCountryCode.toUpperCase();
  const market = resolvePricingMarket(nextCountry);
  const active =
    user.subscription_status === 'active' ||
    user.subscription_status === 'trialing' ||
    user.subscription_status === 'past_due';

  if (active) {
    const currentCountry = (user.billing_country_code ?? user.country_code).toUpperCase();
    const currentMarket = resolvePricingMarket(currentCountry);
    if (currentMarket.chargeCurrency !== market.chargeCurrency && !input.confirmCurrencyChange) {
      throw new HttpError(409, 'CURRENCY_CHANGE_REQUIRES_CONFIRMATION', {
        currentCurrency: currentMarket.chargeCurrency,
        nextCurrency: market.chargeCurrency,
        message:
          'Your current subscription is billed in a different currency. The new rate applies at the next renewal after confirmation.',
      });
    }
  }

  const region =
    nextCountry === 'CA' ? (input.billingRegion?.toUpperCase() ?? null) : null;

  const updated = await queryOne(
    `UPDATE users SET
       billing_country_code = $2,
       billing_region = $3,
       pricing_market = $4,
       preferred_currency = $5,
       country_updated_at = now(),
       updated_at = now()
     WHERE id = $1
     RETURNING billing_country_code, billing_region, pricing_market, preferred_currency`,
    [userId, nextCountry, region, market.id, market.displayCurrency],
  );

  return {
    billingCountryCode: nextCountry,
    billingRegion: region,
    pricingMarket: market.id as PricingMarketId,
    preferredCurrency: market.displayCurrency,
    catalog: catalogForMarket(nextCountry),
    deferredUntilRenewal: active,
  };
}

export async function recordWebhookEvent(eventId: string, type: string, payload: unknown) {
  const existing = await queryOne<{ id: string }>(
    'SELECT id FROM stripe_webhook_events WHERE id = $1',
    [eventId],
  );
  if (existing) return { duplicate: true as const };
  await query(
    'INSERT INTO stripe_webhook_events (id, type, payload) VALUES ($1, $2, $3::jsonb)',
    [eventId, type, JSON.stringify(payload)],
  );
  return { duplicate: false as const };
}
