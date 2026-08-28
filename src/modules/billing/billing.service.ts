import { z } from 'zod';
import { env } from '../../config/env';
import { queryOne } from '../../db/pool';
import { HttpError } from '../../lib/httpError';
import { planOf, PLANS, type PlanId } from './plans';

export const checkoutSchema = z.object({
  plan: z.enum(['INVESTOR', 'PRO']),
});

export const mockSubscribeSchema = z.object({
  plan: z.enum(['FREE', 'INVESTOR', 'PRO']),
});

export function listPlans() {
  return Object.values(PLANS);
}

export async function getBilling(userId: string) {
  const user = await queryOne<{ plan: PlanId; stripe_customer_id: string | null }>(
    'SELECT plan, stripe_customer_id FROM users WHERE id = $1',
    [userId],
  );
  if (!user) throw new HttpError(404, 'User not found');
  return {
    plan: planOf(user.plan),
    stripeCustomerId: user.stripe_customer_id,
    mockMode: !env.STRIPE_SECRET_KEY,
  };
}

export async function createCheckout(userId: string, plan: 'INVESTOR' | 'PRO') {
  if (!env.STRIPE_SECRET_KEY) {
    return {
      mock: true as const,
      message: 'Stripe is not configured. In development, POST /billing/mock-subscribe to switch plan.',
      plan,
      checkoutUrl: null,
    };
  }

  const priceId = plan === 'INVESTOR' ? env.STRIPE_PRICE_INVESTOR : env.STRIPE_PRICE_PRO;
  if (!priceId) throw new HttpError(500, `Missing Stripe price id for ${plan}`);

  // Stripe SDK is intentionally not a V1 dependency. When keys are present,
  // replace this block with stripe.checkout.sessions.create.
  throw new HttpError(
    501,
    'Stripe keys are set but Checkout is not wired yet. Use mock-subscribe in development.',
  );
}

export async function mockSubscribe(userId: string, plan: PlanId) {
  if (env.NODE_ENV === 'production') {
    throw new HttpError(403, 'Mock billing is disabled in production');
  }
  const status = plan === 'FREE' ? 'none' : 'active';
  const user = await queryOne<{ plan: PlanId }>(
    'UPDATE users SET plan = $2, subscription_status = $3, updated_at = now() WHERE id = $1 RETURNING plan',
    [userId, plan, status],
  );
  if (!user) throw new HttpError(404, 'User not found');
  return { plan: planOf(user.plan) };
}
