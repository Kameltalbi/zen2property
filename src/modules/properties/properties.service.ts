import { z } from 'zod';
import { query, queryOne } from '../../db/pool';
import { HttpError, notFound } from '../../lib/httpError';
import { planOf, upgradeHint } from '../billing/plans';
import type { PropertyRow } from '../../types/domain';

export const createPropertySchema = z.object({
  name: z.string().min(1),
  address: z.string().min(1),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  countryCode: z.string().length(2).optional(),
  surface: z.number().positive().optional(),
  type: z.enum(['APARTMENT', 'HOUSE', 'STUDIO', 'OTHER']),
  monthlyRent: z.number().nonnegative().optional(),
  monthlyCharges: z.number().nonnegative().optional(),
  currency: z.string().length(3).optional(),
});

export const updatePropertySchema = createPropertySchema.partial();

function mapProperty(row: PropertyRow) {
  return {
    id: row.id,
    name: row.name,
    address: row.address,
    city: row.city,
    postalCode: row.postal_code,
    countryCode: row.country_code.trim(),
    surface: row.surface === null ? null : Number(row.surface),
    type: row.type,
    monthlyRent: row.monthly_rent === null ? null : Number(row.monthly_rent),
    monthlyCharges: Number(row.monthly_charges),
    currency: row.currency,
    createdAt: row.created_at,
  };
}

export async function listProperties(userId: string) {
  const rows = await query<PropertyRow>(
    'SELECT * FROM properties WHERE user_id = $1 ORDER BY created_at DESC',
    [userId],
  );
  return rows.map(mapProperty);
}

export async function getProperty(userId: string, id: string) {
  const row = await queryOne<PropertyRow>('SELECT * FROM properties WHERE id = $1 AND user_id = $2', [id, userId]);
  if (!row) notFound('Property');
  return mapProperty(row);
}

export async function createProperty(userId: string, input: z.infer<typeof createPropertySchema>) {
  const owner = await queryOne<{ country_code: string; default_currency: string; plan: string }>(
    'SELECT country_code, default_currency, plan FROM users WHERE id = $1',
    [userId],
  );
  if (!owner) throw new HttpError(401, 'User not found');

  const plan = planOf(owner.plan);
  const count = await queryOne<{ n: string }>('SELECT COUNT(*)::text AS n FROM properties WHERE user_id = $1', [
    userId,
  ]);
  if (plan.maxProperties != null && Number(count?.n ?? 0) >= plan.maxProperties) {
    throw new HttpError(402, upgradeHint(plan));
  }

  const row = await queryOne<PropertyRow>(
    `INSERT INTO properties
       (user_id, name, address, city, postal_code, country_code, surface, type, monthly_rent, monthly_charges, currency)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
     RETURNING *`,
    [
      userId,
      input.name,
      input.address,
      input.city ?? null,
      input.postalCode ?? null,
      (input.countryCode ?? owner.country_code).toUpperCase(),
      input.surface ?? null,
      input.type,
      input.monthlyRent ?? null,
      input.monthlyCharges ?? 0,
      (input.currency ?? owner.default_currency).toUpperCase(),
    ],
  );
  if (!row) throw new HttpError(500, 'Unable to create property');
  return mapProperty(row);
}

export async function updateProperty(userId: string, id: string, input: z.infer<typeof updatePropertySchema>) {
  const row = await queryOne<PropertyRow>(
    `UPDATE properties SET
       name = COALESCE($3, name),
       address = COALESCE($4, address),
       city = COALESCE($5, city),
       postal_code = COALESCE($6, postal_code),
       country_code = COALESCE($7, country_code),
       surface = COALESCE($8, surface),
       type = COALESCE($9, type),
       monthly_rent = COALESCE($10, monthly_rent),
       monthly_charges = COALESCE($11, monthly_charges),
       currency = COALESCE($12, currency),
       updated_at = now()
     WHERE id = $1 AND user_id = $2
     RETURNING *`,
    [
      id,
      userId,
      input.name ?? null,
      input.address ?? null,
      input.city ?? null,
      input.postalCode ?? null,
      input.countryCode?.toUpperCase() ?? null,
      input.surface ?? null,
      input.type ?? null,
      input.monthlyRent ?? null,
      input.monthlyCharges ?? null,
      input.currency?.toUpperCase() ?? null,
    ],
  );
  if (!row) notFound('Property');
  return mapProperty(row);
}

export async function deleteProperty(userId: string, id: string) {
  const existing = await queryOne<{ id: string }>(
    'SELECT id FROM properties WHERE id = $1 AND user_id = $2',
    [id, userId],
  );
  if (!existing) notFound('Property');

  const related = await queryOne<{ tenants: string; leases: string; payments: string }>(
    `SELECT
       (SELECT COUNT(*)::text FROM tenants WHERE property_id = $1 AND user_id = $2) AS tenants,
       (SELECT COUNT(*)::text FROM leases WHERE property_id = $1 AND user_id = $2) AS leases,
       (SELECT COUNT(*)::text FROM payments WHERE property_id = $1 AND user_id = $2) AS payments`,
    [id, userId],
  );
  const tenants = Number(related?.tenants ?? 0);
  const leases = Number(related?.leases ?? 0);
  const payments = Number(related?.payments ?? 0);
  if (tenants > 0 || leases > 0 || payments > 0) {
    throw new HttpError(
      409,
      'Remove related tenants, leases and payments before deleting this property.',
    );
  }

  try {
    const row = await queryOne<{ id: string }>(
      'DELETE FROM properties WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, userId],
    );
    if (!row) notFound('Property');
  } catch (err) {
    const code = typeof err === 'object' && err && 'code' in err ? String((err as { code: unknown }).code) : '';
    if (code === '23503') {
      throw new HttpError(
        409,
        'Remove related tenants, leases and payments before deleting this property.',
      );
    }
    throw err;
  }
}
