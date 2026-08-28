import { z } from 'zod';
import { query, queryOne } from '../../db/pool';
import { HttpError, notFound } from '../../lib/httpError';
import type { PaymentRow } from '../../types/domain';

export const createPaymentSchema = z.object({
  propertyId: z.string().uuid(),
  tenantId: z.string().uuid().optional(),
  amount: z.number().positive(),
  rentAmount: z.number().nonnegative().optional(),
  chargesAmount: z.number().nonnegative().optional(),
  currency: z.string().length(3).optional(),
  periodStart: z.string().date(),
  periodEnd: z.string().date(),
  dueDate: z.string().date(),
  paidDate: z.string().date().optional(),
  status: z.enum(['PAID', 'PENDING', 'LATE', 'PARTIAL']).default('PENDING'),
  method: z.enum(['BANK_TRANSFER', 'CHECK', 'CASH', 'OTHER']).optional(),
  description: z.string().optional(),
  notes: z.string().optional(),
});

export const updatePaymentSchema = createPaymentSchema.partial().omit({ propertyId: true });

export const markPaidSchema = z.object({
  paidDate: z.string().date().optional(),
  method: z.enum(['BANK_TRANSFER', 'CHECK', 'CASH', 'OTHER']).optional(),
});

function mapPayment(row: PaymentRow) {
  return {
    id: row.id,
    propertyId: row.property_id,
    tenantId: row.tenant_id,
    amount: Number(row.amount),
    rentAmount: row.rent_amount === null ? null : Number(row.rent_amount),
    chargesAmount: row.charges_amount === null ? null : Number(row.charges_amount),
    currency: row.currency,
    periodStart: row.period_start,
    periodEnd: row.period_end,
    dueDate: row.due_date,
    paidDate: row.paid_date,
    status: row.status,
    method: row.method,
    description: row.description,
    notes: row.notes,
    createdAt: row.created_at,
  };
}

export async function listPayments(userId: string, filters: { propertyId?: string; tenantId?: string; status?: string }) {
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
  const rows = await query<PaymentRow>(
    `SELECT * FROM payments WHERE ${clauses.join(' AND ')} ORDER BY due_date DESC`,
    params,
  );
  return rows.map(mapPayment);
}

export async function getPayment(userId: string, id: string) {
  const row = await queryOne<PaymentRow>('SELECT * FROM payments WHERE id = $1 AND user_id = $2', [id, userId]);
  if (!row) notFound('Payment');
  return mapPayment(row);
}

export async function getPaymentRow(userId: string, id: string): Promise<PaymentRow> {
  const row = await queryOne<PaymentRow>('SELECT * FROM payments WHERE id = $1 AND user_id = $2', [id, userId]);
  if (!row) notFound('Payment');
  return row;
}

export async function createPayment(userId: string, input: z.infer<typeof createPaymentSchema>) {
  const property = await queryOne<{ id: string; currency: string }>(
    'SELECT id, currency FROM properties WHERE id = $1 AND user_id = $2',
    [input.propertyId, userId],
  );
  if (!property) throw new HttpError(404, 'Property not found');

  if (input.tenantId) {
    const tenant = await queryOne<{ id: string }>(
      'SELECT id FROM tenants WHERE id = $1 AND user_id = $2 AND property_id = $3',
      [input.tenantId, userId, input.propertyId],
    );
    if (!tenant) throw new HttpError(404, 'Tenant not found for this property');
  }

  const row = await queryOne<PaymentRow>(
    `INSERT INTO payments
       (user_id, property_id, tenant_id, amount, rent_amount, charges_amount, currency,
        period_start, period_end, due_date, paid_date, status, method, description, notes)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
     RETURNING *`,
    [
      userId,
      input.propertyId,
      input.tenantId ?? null,
      input.amount,
      input.rentAmount ?? null,
      input.chargesAmount ?? null,
      (input.currency ?? property.currency).toUpperCase(),
      input.periodStart,
      input.periodEnd,
      input.dueDate,
      input.paidDate ?? null,
      input.status,
      input.method ?? null,
      input.description ?? null,
      input.notes ?? null,
    ],
  );
  if (!row) throw new HttpError(500, 'Unable to create payment');
  return mapPayment(row);
}

export async function updatePayment(userId: string, id: string, input: z.infer<typeof updatePaymentSchema>) {
  const row = await queryOne<PaymentRow>(
    `UPDATE payments SET
       tenant_id = COALESCE($3, tenant_id),
       amount = COALESCE($4, amount),
       rent_amount = COALESCE($5, rent_amount),
       charges_amount = COALESCE($6, charges_amount),
       currency = COALESCE($7, currency),
       period_start = COALESCE($8, period_start),
       period_end = COALESCE($9, period_end),
       due_date = COALESCE($10, due_date),
       paid_date = COALESCE($11, paid_date),
       status = COALESCE($12, status),
       method = COALESCE($13, method),
       description = COALESCE($14, description),
       notes = COALESCE($15, notes),
       updated_at = now()
     WHERE id = $1 AND user_id = $2
     RETURNING *`,
    [
      id,
      userId,
      input.tenantId ?? null,
      input.amount ?? null,
      input.rentAmount ?? null,
      input.chargesAmount ?? null,
      input.currency?.toUpperCase() ?? null,
      input.periodStart ?? null,
      input.periodEnd ?? null,
      input.dueDate ?? null,
      input.paidDate ?? null,
      input.status ?? null,
      input.method ?? null,
      input.description ?? null,
      input.notes ?? null,
    ],
  );
  if (!row) notFound('Payment');
  return mapPayment(row);
}

export async function markPaid(userId: string, id: string, input: z.infer<typeof markPaidSchema>) {
  const row = await queryOne<PaymentRow>(
    `UPDATE payments SET
       status = 'PAID',
       paid_date = COALESCE($3::date, CURRENT_DATE),
       method = COALESCE($4, method),
       updated_at = now()
     WHERE id = $1 AND user_id = $2
     RETURNING *`,
    [id, userId, input.paidDate ?? null, input.method ?? null],
  );
  if (!row) notFound('Payment');
  return mapPayment(row);
}
