import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { query, queryOne } from '../../db/pool';
import { HttpError, notFound } from '../../lib/httpError';
import type { PlanId } from '../billing/plans';
import { resolvePricingMarket } from '../billing/pricingMarkets';

export const listUsersQuery = z.object({
  q: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export const patchUserSchema = z.object({
  plan: z.enum(['FREE', 'SMART', 'PREMIUM', 'AGENCY', 'PRO', 'INVESTOR']).optional(),
  isActive: z.boolean().optional(),
  subscriptionStatus: z.enum(['none', 'trialing', 'active', 'past_due', 'canceled']).optional(),
});

export const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  fullName: z.string().min(1),
  countryCode: z.string().length(2),
  plan: z.enum(['FREE', 'SMART', 'PREMIUM', 'AGENCY']).default('FREE'),
});

export const extendUserSchema = z.object({
  plan: z.enum(['SMART', 'PREMIUM', 'AGENCY']).optional(),
  period: z.enum(['monthly', 'yearly']).default('monthly'),
});

const PAID_PLANS = new Set(['SMART', 'PREMIUM', 'AGENCY']);

function normalizePlan(plan: string): PlanId {
  if (plan === 'INVESTOR') return 'PREMIUM';
  if (plan === 'PRO') return 'AGENCY';
  if (plan === 'SMART' || plan === 'PREMIUM' || plan === 'AGENCY' || plan === 'FREE') return plan;
  return 'FREE';
}

type AdminUserRow = {
  id: string;
  email: string;
  full_name: string;
  country_code: string;
  plan: PlanId;
  subscription_status: string;
  is_active: boolean;
  is_admin: boolean;
  stripe_customer_id: string | null;
  created_at: string;
};

function mapAdminUser(row: AdminUserRow) {
  return {
    id: row.id,
    email: row.email,
    fullName: row.full_name,
    countryCode: row.country_code.trim(),
    plan: row.plan,
    subscriptionStatus: row.subscription_status,
    isActive: row.is_active,
    isAdmin: row.is_admin,
    stripeCustomerId: row.stripe_customer_id,
    createdAt: row.created_at,
  };
}

export async function getAdminStats() {
  const counts = await queryOne<{
    users: string;
    paid: string;
    properties: string;
    tenants: string;
    investor: string;
    pro: string;
  }>(
    `SELECT
       (SELECT COUNT(*)::text FROM users) AS users,
       (SELECT COUNT(*)::text FROM users WHERE is_active AND plan IN ('SMART', 'PREMIUM', 'AGENCY')) AS paid,
       (SELECT COUNT(*)::text FROM properties) AS properties,
       (SELECT COUNT(*)::text FROM tenants) AS tenants,
       (SELECT COUNT(*)::text FROM users WHERE is_active AND plan = 'SMART') AS investor,
       (SELECT COUNT(*)::text FROM users WHERE is_active AND plan = 'PREMIUM') AS pro`,
  );

  const smart = Number(counts?.investor ?? 0);
  const premium = Number(counts?.pro ?? 0);
  const mrr = smart * 7.5 + premium * 14.99;

  return {
    totalUsers: Number(counts?.users ?? 0),
    activeSubscriptions: Number(counts?.paid ?? 0),
    properties: Number(counts?.properties ?? 0),
    tenants: Number(counts?.tenants ?? 0),
    estimatedMrrUsd: mrr,
  };
}

export async function listAdminUsers(input: z.infer<typeof listUsersQuery>) {
  const params: unknown[] = [];
  const where = [];
  if (input.q?.trim()) {
    params.push(`%${input.q.trim().toLowerCase()}%`);
    where.push(`(LOWER(email) LIKE $${params.length} OR LOWER(full_name) LIKE $${params.length})`);
  }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const totalRow = await queryOne<{ n: string }>(`SELECT COUNT(*)::text AS n FROM users ${whereSql}`, params);
  const total = Number(totalRow?.n ?? 0);
  const offset = (input.page - 1) * input.limit;
  params.push(input.limit, offset);
  const rows = await query<AdminUserRow>(
    `SELECT id, email, full_name, country_code, plan, subscription_status, is_active, is_admin,
            stripe_customer_id, created_at::text
     FROM users ${whereSql}
     ORDER BY created_at DESC
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params,
  );
  return {
    users: rows.map(mapAdminUser),
    page: input.page,
    limit: input.limit,
    total,
  };
}

export async function patchAdminUser(
  actorId: string,
  userId: string,
  input: z.infer<typeof patchUserSchema>,
) {
  if (actorId === userId && input.isActive === false) {
    throw new HttpError(400, 'You cannot disable your own account');
  }

  const current = await queryOne<AdminUserRow>(
    `SELECT id, email, full_name, country_code, plan, subscription_status, is_active, is_admin,
            stripe_customer_id, created_at::text
     FROM users WHERE id = $1`,
    [userId],
  );
  if (!current) notFound('User');

  let plan =
    input.plan === 'INVESTOR' ? 'PREMIUM' : input.plan === 'PRO' ? 'AGENCY' : (input.plan ?? current.plan);
  let subscriptionStatus = input.subscriptionStatus ?? current.subscription_status;
  if (input.plan && !input.subscriptionStatus) {
    subscriptionStatus = input.plan === 'FREE' ? 'none' : 'active';
  }

  const row = await queryOne<AdminUserRow>(
    `UPDATE users SET
       plan = $2,
       subscription_status = $3,
       is_active = COALESCE($4, is_active),
       updated_at = now()
     WHERE id = $1
     RETURNING id, email, full_name, country_code, plan, subscription_status, is_active, is_admin,
               stripe_customer_id, created_at::text`,
    [userId, plan, subscriptionStatus, input.isActive ?? null],
  );
  if (!row) notFound('User');
  return mapAdminUser(row);
}

export async function createAdminUser(input: z.infer<typeof createUserSchema>) {
  const email = input.email.toLowerCase();
  const existing = await queryOne<{ id: string }>('SELECT id FROM users WHERE email = $1', [email]);
  if (existing) throw new HttpError(409, 'An account already exists for this email');

  const countryCode = input.countryCode.toUpperCase();
  const country = await queryOne<{ default_currency: string }>(
    'SELECT default_currency FROM countries WHERE code = $1',
    [countryCode],
  );
  if (!country) throw new HttpError(400, 'Unknown country');

  const market = resolvePricingMarket(countryCode);
  const plan = normalizePlan(input.plan);
  const subscriptionStatus = PAID_PLANS.has(plan) ? 'active' : 'none';
  const passwordHash = await bcrypt.hash(input.password, 12);

  const row = await queryOne<AdminUserRow>(
    `INSERT INTO users (
       email, password_hash, full_name, country_code, locale, default_currency,
       billing_country_code, pricing_market, preferred_currency, country_updated_at,
       plan, subscription_status
     )
     VALUES ($1, $2, $3, $4, 'fr', $5, $4, $6, $7, now(), $8, $9)
     RETURNING id, email, full_name, country_code, plan, subscription_status, is_active, is_admin,
               stripe_customer_id, created_at::text`,
    [
      email,
      passwordHash,
      input.fullName,
      countryCode,
      country.default_currency,
      market.id,
      market.displayCurrency,
      plan,
      subscriptionStatus,
    ],
  );
  if (!row) throw new HttpError(500, 'Unable to create account');
  return mapAdminUser(row);
}

export async function deleteAdminUser(actorId: string, userId: string) {
  if (actorId === userId) throw new HttpError(400, 'You cannot delete your own account');
  const row = await queryOne<{ id: string }>(
    'SELECT id FROM users WHERE id = $1',
    [userId],
  );
  if (!row) notFound('User');
  await queryOne('DELETE FROM users WHERE id = $1 RETURNING id', [userId]);
  return { deleted: true as const, id: userId };
}

export async function cancelAdminUser(actorId: string, userId: string) {
  if (actorId === userId) throw new HttpError(400, 'You cannot cancel your own subscription from here');
  const current = await queryOne<AdminUserRow>(
    `SELECT id, email, full_name, country_code, plan, subscription_status, is_active, is_admin,
            stripe_customer_id, created_at::text
     FROM users WHERE id = $1`,
    [userId],
  );
  if (!current) notFound('User');

  await query(
    `UPDATE subscriptions SET status = 'canceled', updated_at = now()
     WHERE user_id = $1 AND status IN ('trialing', 'active', 'past_due')`,
    [userId],
  );
  const row = await queryOne<AdminUserRow>(
    `UPDATE users SET plan = 'FREE', subscription_status = 'canceled', updated_at = now()
     WHERE id = $1
     RETURNING id, email, full_name, country_code, plan, subscription_status, is_active, is_admin,
               stripe_customer_id, created_at::text`,
    [userId],
  );
  if (!row) notFound('User');
  return mapAdminUser(row);
}

export async function extendAdminUser(
  _actorId: string,
  userId: string,
  input: z.infer<typeof extendUserSchema>,
) {
  const current = await queryOne<AdminUserRow>(
    `SELECT id, email, full_name, country_code, plan, subscription_status, is_active, is_admin,
            stripe_customer_id, created_at::text
     FROM users WHERE id = $1`,
    [userId],
  );
  if (!current) notFound('User');

  const currentPlan = normalizePlan(current.plan);
  const plan = input.plan ?? (PAID_PLANS.has(currentPlan) ? currentPlan : 'SMART');
  const interval = input.period === 'yearly' ? '1 year' : '1 month';

  await queryOne(
    `UPDATE users SET plan = $2, subscription_status = 'active', is_active = TRUE, updated_at = now()
     WHERE id = $1`,
    [userId, plan],
  );

  const active = await queryOne<{ id: string }>(
    `SELECT id FROM subscriptions
     WHERE user_id = $1 AND status IN ('trialing', 'active', 'past_due')
     LIMIT 1`,
    [userId],
  );
  if (active) {
    await query(
      `UPDATE subscriptions SET
         plan = $2,
         billing_period = $3,
         status = 'active',
         current_period_end = GREATEST(COALESCE(current_period_end, now()), now()) + $4::interval,
         updated_at = now()
       WHERE id = $1`,
      [active.id, plan, input.period, interval],
    );
  } else {
    await query(
      `INSERT INTO subscriptions (user_id, plan, billing_period, status, current_period_end)
       VALUES ($1, $2, $3, 'active', now() + $4::interval)`,
      [userId, plan, input.period, interval],
    );
  }

  const row = await queryOne<AdminUserRow>(
    `SELECT id, email, full_name, country_code, plan, subscription_status, is_active, is_admin,
            stripe_customer_id, created_at::text
     FROM users WHERE id = $1`,
    [userId],
  );
  if (!row) notFound('User');
  return mapAdminUser(row);
}
