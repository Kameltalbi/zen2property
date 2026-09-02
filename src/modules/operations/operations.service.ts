import { z } from 'zod';
import { query, queryOne } from '../../db/pool';
import { notFound } from '../../lib/httpError';

const uuid = z.string().uuid();

export const expenseSchema = z.object({
  propertyId: uuid,
  maintenanceId: uuid.optional(),
  category: z.enum(['MAINTENANCE', 'REPAIR', 'INSURANCE', 'TAXES', 'CONDO', 'SERVICES', 'MANAGEMENT', 'WORKS', 'BANK_FEES', 'OTHER']),
  label: z.string().min(1),
  amount: z.number().nonnegative(),
  currency: z.string().length(3),
  expenseDate: z.string().date(),
  vendor: z.string().optional(),
  paymentMethod: z.string().optional(),
  recurring: z.boolean().optional(),
  invoicePath: z.string().optional(),
  notes: z.string().optional(),
});

export const maintenanceSchema = z.object({
  propertyId: uuid,
  tenantId: uuid.optional(),
  title: z.string().min(1),
  description: z.string().optional(),
  category: z.string().min(1).default('OTHER'),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).optional(),
  status: z.enum(['NEW', 'TO_PLAN', 'PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
  scheduledAt: z.string().datetime().optional(),
  provider: z.string().optional(),
  estimatedCost: z.number().nonnegative().optional(),
  actualCost: z.number().nonnegative().optional(),
  ownerResponsible: z.boolean().optional(),
  notes: z.string().optional(),
});

export const maintenanceUpdateSchema = maintenanceSchema.partial().omit({ propertyId: true });

function mapExpense(row: Record<string, unknown>) {
  return {
    id: row.id,
    propertyId: row.property_id,
    maintenanceId: row.maintenance_id,
    category: row.category,
    label: row.label,
    amount: Number(row.amount),
    currency: row.currency,
    expenseDate: row.expense_date,
    vendor: row.vendor,
    paymentMethod: row.payment_method,
    recurring: row.recurring,
    invoicePath: row.invoice_path,
    notes: row.notes,
    createdAt: row.created_at,
  };
}

function mapMaintenance(row: Record<string, unknown>) {
  return {
    id: row.id,
    propertyId: row.property_id,
    tenantId: row.tenant_id,
    title: row.title,
    description: row.description,
    category: row.category,
    priority: row.priority,
    status: row.status,
    scheduledAt: row.scheduled_at,
    provider: row.provider,
    estimatedCost: row.estimated_cost === null ? null : Number(row.estimated_cost),
    actualCost: row.actual_cost === null ? null : Number(row.actual_cost),
    ownerResponsible: row.owner_responsible,
    completedAt: row.completed_at,
    notes: row.notes,
    createdAt: row.created_at,
  };
}

export async function listExpenses(userId: string) {
  const rows = await query<Record<string, unknown>>(
    'SELECT * FROM expenses WHERE user_id = $1 ORDER BY expense_date DESC, created_at DESC',
    [userId],
  );
  return rows.map(mapExpense);
}

export async function createExpense(userId: string, input: z.infer<typeof expenseSchema>) {
  const row = await queryOne<Record<string, unknown>>(
    `INSERT INTO expenses
      (user_id, property_id, maintenance_id, category, label, amount, currency, expense_date, vendor, payment_method, recurring, invoice_path, notes)
     SELECT $1, p.id, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13
     FROM properties p
     WHERE p.id = $2 AND p.user_id = $1
       AND ($3 IS NULL OR EXISTS (
         SELECT 1 FROM maintenance_requests m WHERE m.id = $3 AND m.user_id = $1
       ))
     RETURNING *`,
    [userId, input.propertyId, input.maintenanceId ?? null, input.category, input.label, input.amount, input.currency.toUpperCase(), input.expenseDate, input.vendor ?? null, input.paymentMethod ?? null, input.recurring ?? false, input.invoicePath ?? null, input.notes ?? null],
  );
  if (!row) notFound('Property');
  return mapExpense(row);
}

export async function listMaintenance(userId: string) {
  const rows = await query<Record<string, unknown>>(
    'SELECT * FROM maintenance_requests WHERE user_id = $1 ORDER BY COALESCE(scheduled_at, created_at) DESC',
    [userId],
  );
  return rows.map(mapMaintenance);
}

export async function createMaintenance(userId: string, input: z.infer<typeof maintenanceSchema>) {
  const row = await queryOne<Record<string, unknown>>(
    `INSERT INTO maintenance_requests
      (user_id, property_id, tenant_id, title, description, category, priority, status, scheduled_at, provider, estimated_cost, actual_cost, owner_responsible, notes)
     SELECT $1, p.id, CASE WHEN t.id IS NULL THEN NULL ELSE t.id END, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14
     FROM properties p
     LEFT JOIN tenants t ON t.id = $3 AND t.property_id = p.id AND t.user_id = $1
     WHERE p.id = $2 AND p.user_id = $1
     RETURNING *`,
    [userId, input.propertyId, input.tenantId ?? null, input.title, input.description ?? null, input.category, input.priority ?? 'NORMAL', input.status ?? 'NEW', input.scheduledAt ?? null, input.provider ?? null, input.estimatedCost ?? null, input.actualCost ?? null, input.ownerResponsible ?? true, input.notes ?? null],
  );
  if (!row) notFound('Property');
  return mapMaintenance(row);
}

export async function updateMaintenance(userId: string, id: string, input: z.infer<typeof maintenanceUpdateSchema>) {
  const row = await queryOne<Record<string, unknown>>(
    `UPDATE maintenance_requests SET
      title = COALESCE($3, title), tenant_id = COALESCE($4, tenant_id), description = COALESCE($5, description), category = COALESCE($6, category),
      priority = COALESCE($7, priority), status = COALESCE($8, status), scheduled_at = COALESCE($9, scheduled_at),
      provider = COALESCE($10, provider), estimated_cost = COALESCE($11, estimated_cost), actual_cost = COALESCE($12, actual_cost),
      owner_responsible = COALESCE($13, owner_responsible), notes = COALESCE($14, notes),
      completed_at = CASE WHEN $8 = 'COMPLETED' THEN COALESCE(completed_at, now()) ELSE completed_at END, updated_at = now()
     WHERE id = $1 AND user_id = $2 RETURNING *`,
    [id, userId, input.title ?? null, input.tenantId ?? null, input.description ?? null, input.category ?? null, input.priority ?? null, input.status ?? null, input.scheduledAt ?? null, input.provider ?? null, input.estimatedCost ?? null, input.actualCost ?? null, input.ownerResponsible ?? null, input.notes ?? null],
  );
  if (!row) notFound('Maintenance request');
  return mapMaintenance(row);
}

export async function convertMaintenanceToExpense(userId: string, id: string, currency: string) {
  const maintenance = await queryOne<Record<string, unknown>>(
    'SELECT * FROM maintenance_requests WHERE id = $1 AND user_id = $2 AND status = $3 AND actual_cost IS NOT NULL',
    [id, userId, 'COMPLETED'],
  );
  if (!maintenance) notFound('Completed maintenance request');
  return createExpense(userId, {
    propertyId: String(maintenance.property_id),
    maintenanceId: String(maintenance.id),
    category: 'MAINTENANCE',
    label: String(maintenance.title),
    amount: Number(maintenance.actual_cost),
    currency,
    expenseDate: new Date().toISOString().slice(0, 10),
  });
}
