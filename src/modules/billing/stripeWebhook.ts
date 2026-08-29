import type Stripe from 'stripe';
import { query, queryOne } from '../../db/pool';
import { planIdFromCode, type BillingPeriod, type PaidPlanCode } from './pricingMarkets';
import type { PlanId } from './plans';
import { getStripe, isWhitelistedPriceId } from './stripeClient';
import { recordWebhookEvent } from './billing.service';

function mapStripeStatus(status: Stripe.Subscription.Status): string {
  switch (status) {
    case 'trialing':
      return 'trialing';
    case 'active':
      return 'active';
    case 'past_due':
      return 'past_due';
    case 'canceled':
    case 'unpaid':
    case 'incomplete_expired':
      return 'canceled';
    case 'incomplete':
      return 'incomplete';
    default:
      return 'none';
  }
}

async function applyPlanToUser(
  userId: string,
  plan: PlanId,
  subscriptionStatus: string,
  stripeCustomerId: string | null,
) {
  await queryOne(
    `UPDATE users SET
       plan = $2,
       subscription_status = $3,
       stripe_customer_id = COALESCE($4, stripe_customer_id),
       updated_at = now()
     WHERE id = $1
     RETURNING id`,
    [userId, plan, subscriptionStatus, stripeCustomerId],
  );
}

async function upsertSubscription(row: {
  userId: string;
  stripeSubscriptionId: string;
  stripeCustomerId: string | null;
  plan: PlanId;
  billingPeriod: BillingPeriod | null;
  pricingMarket: string | null;
  currency: string | null;
  status: string;
  currentPeriodEnd: Date | null;
}) {
  await query(
    `INSERT INTO subscriptions (
       user_id, stripe_subscription_id, stripe_customer_id, plan, billing_period,
       pricing_market, currency, status, current_period_end, updated_at
     ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9, now())
     ON CONFLICT (stripe_subscription_id) DO UPDATE SET
       plan = EXCLUDED.plan,
       billing_period = EXCLUDED.billing_period,
       pricing_market = EXCLUDED.pricing_market,
       currency = EXCLUDED.currency,
       status = EXCLUDED.status,
       current_period_end = EXCLUDED.current_period_end,
       stripe_customer_id = COALESCE(EXCLUDED.stripe_customer_id, subscriptions.stripe_customer_id),
       updated_at = now()`,
    [
      row.userId,
      row.stripeSubscriptionId,
      row.stripeCustomerId,
      row.plan,
      row.billingPeriod,
      row.pricingMarket,
      row.currency,
      row.status,
      row.currentPeriodEnd,
    ],
  );
}

function metaString(meta: Stripe.Metadata | null | undefined, key: string): string | null {
  const v = meta?.[key];
  return typeof v === 'string' && v.length > 0 ? v : null;
}

async function activateFromSubscription(sub: Stripe.Subscription, fallbackUserId?: string | null) {
  const userId = metaString(sub.metadata, 'userId') ?? fallbackUserId;
  if (!userId) {
    console.warn('Stripe subscription missing userId metadata', sub.id);
    return;
  }

  const planCode = (metaString(sub.metadata, 'planCode') ?? 'premium') as PaidPlanCode;
  if (planCode !== 'premium' && planCode !== 'pro') {
    console.warn('Invalid planCode on subscription', sub.id, planCode);
    return;
  }

  const priceId = sub.items.data[0]?.price?.id;
  if (!priceId || !isWhitelistedPriceId(priceId)) {
    console.warn('Rejected non-whitelisted Stripe price on subscription', sub.id, priceId);
    return;
  }

  const billingPeriod = (metaString(sub.metadata, 'billingPeriod') as BillingPeriod | null) ?? null;
  const pricingMarket = metaString(sub.metadata, 'pricingMarket');
  const currency = (sub.currency ?? metaString(sub.metadata, 'currency') ?? '').toUpperCase() || null;
  const status = mapStripeStatus(sub.status);
  const planId = status === 'canceled' || status === 'none' ? ('FREE' as PlanId) : planIdFromCode(planCode);
  const userStatus = status === 'incomplete' ? 'none' : status === 'canceled' ? 'canceled' : status;
  const effectivePlan: PlanId =
    userStatus === 'active' || userStatus === 'trialing' || userStatus === 'past_due' ? planId : 'FREE';

  const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer?.id ?? null;
  const periodEnd = sub.current_period_end ? new Date(sub.current_period_end * 1000) : null;

  await upsertSubscription({
    userId,
    stripeSubscriptionId: sub.id,
    stripeCustomerId: customerId,
    plan: effectivePlan === 'FREE' ? planIdFromCode(planCode) : effectivePlan,
    billingPeriod,
    pricingMarket,
    currency,
    status: userStatus,
    currentPeriodEnd: periodEnd,
  });

  await applyPlanToUser(
    userId,
    effectivePlan,
    userStatus === 'canceled' ? 'canceled' : userStatus === 'none' ? 'none' : userStatus,
    customerId,
  );
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = metaString(session.metadata, 'userId');
  if (!userId) return;

  const customerId = typeof session.customer === 'string' ? session.customer : session.customer?.id ?? null;
  if (customerId) {
    await queryOne(
      `UPDATE users SET stripe_customer_id = $2, updated_at = now() WHERE id = $1 RETURNING id`,
      [userId, customerId],
    );
  }

  const subId = typeof session.subscription === 'string' ? session.subscription : session.subscription?.id;
  if (!subId) return;

  const stripe = getStripe();
  const sub = await stripe.subscriptions.retrieve(subId);
  // Ensure metadata is present even if Checkout did not copy all keys onto the Subscription.
  if (!sub.metadata?.userId && session.metadata) {
    await stripe.subscriptions.update(subId, { metadata: session.metadata });
    const refreshed = await stripe.subscriptions.retrieve(subId);
    await activateFromSubscription(refreshed, userId);
    return;
  }
  await activateFromSubscription(sub, userId);
}

export async function handleStripeWebhook(rawBody: Buffer, signature: string | undefined) {
  const { env } = await import('../../config/env');
  if (!env.STRIPE_WEBHOOK_SECRET) {
    throw Object.assign(new Error('STRIPE_WEBHOOK_SECRET is not configured'), { status: 501 });
  }
  if (!signature) {
    throw Object.assign(new Error('Missing Stripe-Signature header'), { status: 400 });
  }

  const stripe = getStripe();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    throw Object.assign(new Error(`Webhook signature verification failed: ${(err as Error).message}`), {
      status: 400,
    });
  }

  const recorded = await recordWebhookEvent(event.id, event.type, event);
  if (recorded.duplicate) {
    return { received: true, duplicate: true };
  }

  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
      break;
    case 'customer.subscription.updated':
    case 'customer.subscription.created':
      await activateFromSubscription(event.data.object as Stripe.Subscription);
      break;
    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription;
      const userId = metaString(sub.metadata, 'userId');
      if (userId) {
        await upsertSubscription({
          userId,
          stripeSubscriptionId: sub.id,
          stripeCustomerId: typeof sub.customer === 'string' ? sub.customer : sub.customer?.id ?? null,
          plan: 'FREE',
          billingPeriod: (metaString(sub.metadata, 'billingPeriod') as BillingPeriod | null) ?? null,
          pricingMarket: metaString(sub.metadata, 'pricingMarket'),
          currency: (sub.currency ?? '').toUpperCase() || null,
          status: 'canceled',
          currentPeriodEnd: sub.current_period_end ? new Date(sub.current_period_end * 1000) : null,
        });
        await applyPlanToUser(userId, 'FREE', 'canceled', null);
      }
      break;
    }
    default:
      break;
  }

  return { received: true, duplicate: false, type: event.type };
}
