import { z } from 'zod';
import { query, queryOne } from '../../db/pool';
import { HttpError, notFound } from '../../lib/httpError';
import type { PlanId } from '../billing/plans';

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
  const mrr = smart * 9.99 + premium * 19.99;

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
