import { z } from 'zod';
import { query, queryOne } from '../../db/pool';
import { HttpError, notFound } from '../../lib/httpError';
import type { TenantRow } from '../../types/domain';

export const createTenantSchema = z.object({
  propertyId: z.string().uuid(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  moveInDate: z.string().date(),
  moveOutDate: z.string().date().optional(),
  deposit: z.number().nonnegative().default(0),
});

export const updateTenantSchema = createTenantSchema.partial().omit({ propertyId: true });

function mapTenant(row: TenantRow) {
  return {
    id: row.id,
    propertyId: row.property_id,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    phone: row.phone,
    moveInDate: row.move_in_date,
    moveOutDate: row.move_out_date,
    deposit: Number(row.deposit),
    createdAt: row.created_at,
  };
}

async function assertOwnedProperty(userId: string, propertyId: string): Promise<void> {
  const property = await queryOne<{ id: string }>(
    'SELECT id FROM properties WHERE id = $1 AND user_id = $2',
    [propertyId, userId],
  );
  if (!property) throw new HttpError(404, 'Property not found');
}

export async function listTenants(userId: string, propertyId?: string) {
  const rows = propertyId
    ? await query<TenantRow>(
        'SELECT * FROM tenants WHERE user_id = $1 AND property_id = $2 ORDER BY last_name',
        [userId, propertyId],
      )
    : await query<TenantRow>('SELECT * FROM tenants WHERE user_id = $1 ORDER BY last_name', [userId]);
  return rows.map(mapTenant);
}

export async function getTenant(userId: string, id: string) {
  const row = await queryOne<TenantRow>('SELECT * FROM tenants WHERE id = $1 AND user_id = $2', [id, userId]);
  if (!row) notFound('Tenant');
  return mapTenant(row);
}

export async function createTenant(userId: string, input: z.infer<typeof createTenantSchema>) {
  await assertOwnedProperty(userId, input.propertyId);
  const row = await queryOne<TenantRow>(
    `INSERT INTO tenants
       (user_id, property_id, first_name, last_name, email, phone, move_in_date, move_out_date, deposit)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING *`,
    [
      userId,
      input.propertyId,
      input.firstName,
      input.lastName,
      input.email ?? null,
      input.phone ?? null,
      input.moveInDate,
      input.moveOutDate ?? null,
      input.deposit,
    ],
  );
  if (!row) throw new HttpError(500, 'Unable to create tenant');
  return mapTenant(row);
}

export async function updateTenant(userId: string, id: string, input: z.infer<typeof updateTenantSchema>) {
  const row = await queryOne<TenantRow>(
    `UPDATE tenants SET
       first_name = COALESCE($3, first_name),
       last_name = COALESCE($4, last_name),
       email = COALESCE($5, email),
       phone = COALESCE($6, phone),
       move_in_date = COALESCE($7, move_in_date),
       move_out_date = COALESCE($8, move_out_date),
       deposit = COALESCE($9, deposit),
       updated_at = now()
     WHERE id = $1 AND user_id = $2
     RETURNING *`,
    [
      id,
      userId,
      input.firstName ?? null,
      input.lastName ?? null,
      input.email ?? null,
      input.phone ?? null,
      input.moveInDate ?? null,
      input.moveOutDate ?? null,
      input.deposit ?? null,
    ],
  );
  if (!row) notFound('Tenant');
  return mapTenant(row);
}

export async function deleteTenant(userId: string, id: string) {
  const row = await queryOne<{ id: string }>('DELETE FROM tenants WHERE id = $1 AND user_id = $2 RETURNING id', [
    id,
    userId,
  ]);
  if (!row) notFound('Tenant');
}
