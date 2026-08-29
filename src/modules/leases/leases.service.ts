import { z } from 'zod';
import { query, queryOne } from '../../db/pool';
import { HttpError, notFound } from '../../lib/httpError';

export type LeaseRow = {
  id: string;
  user_id: string;
  property_id: string;
  tenant_id: string;
  label: string | null;
  status: 'draft' | 'active' | 'ended' | 'terminated';
  lease_type: 'furnished' | 'unfurnished' | 'commercial' | 'other';
  start_date: string;
  end_date: string | null;
  duration_months: number | null;
  notice_period_days: number;
  monthly_rent: string;
  monthly_charges: string;
  currency: string;
  deposit: string;
  payment_day: number;
  payment_frequency: 'monthly' | 'quarterly';
  rent_increase_frequency: 'yearly' | 'every_2_years' | 'every_3_years' | 'other' | 'none';
  rent_increase_other_months: number | null;
  rent_increase_type: 'percent' | 'fixed' | 'index';
  rent_increase_value: string;
  rent_increase_index: string | null;
  next_increase_date: string | null;
  includes_utilities: boolean;
  pets_allowed: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

const rentIncreaseFrequency = z.enum(['yearly', 'every_2_years', 'every_3_years', 'other', 'none']);

const leaseFieldsSchema = z.object({
  propertyId: z.string().uuid(),
  tenantId: z.string().uuid(),
  label: z.string().max(200).optional(),
  status: z.enum(['draft', 'active', 'ended', 'terminated']).default('active'),
  leaseType: z.enum(['furnished', 'unfurnished', 'commercial', 'other']).default('unfurnished'),
  startDate: z.string().date(),
  endDate: z.string().date().optional().nullable(),
  durationMonths: z.number().int().positive().optional().nullable(),
  noticePeriodDays: z.number().int().nonnegative().default(30),
  monthlyRent: z.number().nonnegative(),
  monthlyCharges: z.number().nonnegative().default(0),
  currency: z.string().length(3),
  deposit: z.number().nonnegative().default(0),
  paymentDay: z.number().int().min(1).max(31).default(1),
  paymentFrequency: z.enum(['monthly', 'quarterly']).default('monthly'),
  rentIncreaseFrequency: rentIncreaseFrequency.default('yearly'),
  rentIncreaseOtherMonths: z.number().int().positive().optional().nullable(),
  rentIncreaseType: z.enum(['percent', 'fixed', 'index']).default('percent'),
  rentIncreaseValue: z.number().nonnegative().default(0),
  rentIncreaseIndex: z.string().max(80).optional().nullable(),
  nextIncreaseDate: z.string().date().optional().nullable(),
  includesUtilities: z.boolean().default(false),
  petsAllowed: z.boolean().default(false),
  notes: z.string().max(4000).optional().nullable(),
});

function refineLeaseIncrease(
  data: {
    rentIncreaseFrequency: z.infer<typeof rentIncreaseFrequency>;
    rentIncreaseOtherMonths?: number | null;
  },
  ctx: z.RefinementCtx,
) {
  if (data.rentIncreaseFrequency === 'other' && !data.rentIncreaseOtherMonths) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['rentIncreaseOtherMonths'],
      message: 'Specify the number of months when frequency is other',
    });
  }
}

export const createLeaseSchema = leaseFieldsSchema.superRefine(refineLeaseIncrease);
export const updateLeaseSchema = leaseFieldsSchema
  .partial()
  .omit({ propertyId: true, tenantId: true })
  .superRefine((data, ctx) => {
    if (data.rentIncreaseFrequency === 'other' && data.rentIncreaseOtherMonths == null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['rentIncreaseOtherMonths'],
        message: 'Specify the number of months when frequency is other',
      });
    }
  });

function mapLease(row: LeaseRow) {
  return {
    id: row.id,
    propertyId: row.property_id,
    tenantId: row.tenant_id,
    label: row.label,
    status: row.status,
    leaseType: row.lease_type,
    startDate: row.start_date,
    endDate: row.end_date,
    durationMonths: row.duration_months,
    noticePeriodDays: row.notice_period_days,
    monthlyRent: Number(row.monthly_rent),
    monthlyCharges: Number(row.monthly_charges),
    currency: row.currency,
    deposit: Number(row.deposit),
    paymentDay: row.payment_day,
    paymentFrequency: row.payment_frequency,
    rentIncreaseFrequency: row.rent_increase_frequency,
    rentIncreaseOtherMonths: row.rent_increase_other_months,
    rentIncreaseType: row.rent_increase_type,
    rentIncreaseValue: Number(row.rent_increase_value),
    rentIncreaseIndex: row.rent_increase_index,
    nextIncreaseDate: row.next_increase_date,
    includesUtilities: row.includes_utilities,
    petsAllowed: row.pets_allowed,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function assertOwnedProperty(userId: string, propertyId: string): Promise<{ currency: string }> {
  const property = await queryOne<{ id: string; currency: string }>(
    'SELECT id, currency FROM properties WHERE id = $1 AND user_id = $2',
    [propertyId, userId],
  );
  if (!property) throw new HttpError(404, 'Property not found');
  return property;
}

async function assertOwnedTenant(userId: string, tenantId: string, propertyId: string): Promise<void> {
  const tenant = await queryOne<{ id: string }>(
    'SELECT id FROM tenants WHERE id = $1 AND user_id = $2 AND property_id = $3',
    [tenantId, userId, propertyId],
  );
  if (!tenant) throw new HttpError(404, 'Tenant not found for this property');
}

export async function listLeases(
  userId: string,
  filters: { propertyId?: string; tenantId?: string; status?: string } = {},
) {
  const params: unknown[] = [userId];
  const clauses = ['user_id = $1'];
  if (filters.propertyId) {
    params.push(filters.propertyId);
    clauses.push(`property_id = $${params.length}`);
  }
  if (filters.tenantId) {
    params.push(filters.tenantId);
    clauses.push(`tenant_id = $${params.length}`);
  }
  if (filters.status) {
    params.push(filters.status);
    clauses.push(`status = $${params.length}`);
  }
  const rows = await query<LeaseRow>(
    `SELECT * FROM leases WHERE ${clauses.join(' AND ')} ORDER BY start_date DESC, created_at DESC`,
    params,
  );
  return rows.map(mapLease);
}

export async function getLease(userId: string, id: string) {
  const row = await queryOne<LeaseRow>('SELECT * FROM leases WHERE id = $1 AND user_id = $2', [id, userId]);
  if (!row) notFound('Lease');
  return mapLease(row);
}

export async function createLease(userId: string, input: z.infer<typeof createLeaseSchema>) {
  const property = await assertOwnedProperty(userId, input.propertyId);
  await assertOwnedTenant(userId, input.tenantId, input.propertyId);
  const currency = input.currency || property.currency;

  const row = await queryOne<LeaseRow>(
    `INSERT INTO leases (
       user_id, property_id, tenant_id, label, status, lease_type,
       start_date, end_date, duration_months, notice_period_days,
       monthly_rent, monthly_charges, currency, deposit,
       payment_day, payment_frequency,
       rent_increase_frequency, rent_increase_other_months, rent_increase_type,
       rent_increase_value, rent_increase_index, next_increase_date,
       includes_utilities, pets_allowed, notes
     ) VALUES (
       $1,$2,$3,$4,$5,$6,
       $7,$8,$9,$10,
       $11,$12,$13,$14,
       $15,$16,
       $17,$18,$19,
       $20,$21,$22,
       $23,$24,$25
     ) RETURNING *`,
    [
      userId,
      input.propertyId,
      input.tenantId,
      input.label ?? null,
      input.status,
      input.leaseType,
      input.startDate,
      input.endDate ?? null,
      input.durationMonths ?? null,
      input.noticePeriodDays,
      input.monthlyRent,
      input.monthlyCharges,
      currency.toUpperCase(),
      input.deposit,
      input.paymentDay,
      input.paymentFrequency,
      input.rentIncreaseFrequency,
      input.rentIncreaseFrequency === 'other' ? input.rentIncreaseOtherMonths ?? null : null,
      input.rentIncreaseType,
      input.rentIncreaseValue,
      input.rentIncreaseIndex ?? null,
      input.nextIncreaseDate ?? null,
      input.includesUtilities,
      input.petsAllowed,
      input.notes ?? null,
    ],
  );
  if (!row) throw new HttpError(500, 'Unable to create lease');
  return mapLease(row);
}

export async function updateLease(userId: string, id: string, input: z.infer<typeof updateLeaseSchema>) {
  const current = await queryOne<LeaseRow>('SELECT * FROM leases WHERE id = $1 AND user_id = $2', [id, userId]);
  if (!current) notFound('Lease');

  const frequency = input.rentIncreaseFrequency ?? current.rent_increase_frequency;
  const otherMonths =
    frequency === 'other'
      ? (input.rentIncreaseOtherMonths ?? current.rent_increase_other_months)
      : null;

  if (frequency === 'other' && !otherMonths) {
    throw new HttpError(400, 'Specify the number of months when frequency is other');
  }

  const row = await queryOne<LeaseRow>(
    `UPDATE leases SET
       label = COALESCE($3, label),
       status = COALESCE($4, status),
       lease_type = COALESCE($5, lease_type),
       start_date = COALESCE($6, start_date),
       end_date = COALESCE($7, end_date),
       duration_months = COALESCE($8, duration_months),
       notice_period_days = COALESCE($9, notice_period_days),
       monthly_rent = COALESCE($10, monthly_rent),
       monthly_charges = COALESCE($11, monthly_charges),
       currency = COALESCE($12, currency),
       deposit = COALESCE($13, deposit),
       payment_day = COALESCE($14, payment_day),
       payment_frequency = COALESCE($15, payment_frequency),
       rent_increase_frequency = COALESCE($16, rent_increase_frequency),
       rent_increase_other_months = $17,
       rent_increase_type = COALESCE($18, rent_increase_type),
       rent_increase_value = COALESCE($19, rent_increase_value),
       rent_increase_index = COALESCE($20, rent_increase_index),
       next_increase_date = COALESCE($21, next_increase_date),
       includes_utilities = COALESCE($22, includes_utilities),
       pets_allowed = COALESCE($23, pets_allowed),
       notes = COALESCE($24, notes),
       updated_at = now()
     WHERE id = $1 AND user_id = $2
     RETURNING *`,
    [
      id,
      userId,
      input.label ?? null,
      input.status ?? null,
      input.leaseType ?? null,
      input.startDate ?? null,
      input.endDate === undefined ? null : input.endDate,
      input.durationMonths === undefined ? null : input.durationMonths,
      input.noticePeriodDays ?? null,
      input.monthlyRent ?? null,
      input.monthlyCharges ?? null,
      input.currency?.toUpperCase() ?? null,
      input.deposit ?? null,
      input.paymentDay ?? null,
      input.paymentFrequency ?? null,
      input.rentIncreaseFrequency ?? null,
      otherMonths,
      input.rentIncreaseType ?? null,
      input.rentIncreaseValue ?? null,
      input.rentIncreaseIndex === undefined ? null : input.rentIncreaseIndex,
      input.nextIncreaseDate === undefined ? null : input.nextIncreaseDate,
      input.includesUtilities ?? null,
      input.petsAllowed ?? null,
      input.notes === undefined ? null : input.notes,
    ],
  );
  if (!row) notFound('Lease');
  return mapLease(row);
}

export async function deleteLease(userId: string, id: string) {
  const row = await queryOne<{ id: string }>('DELETE FROM leases WHERE id = $1 AND user_id = $2 RETURNING id', [
    id,
    userId,
  ]);
  if (!row) notFound('Lease');
}
