import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { z } from 'zod';
import { env } from '../../config/env';
import { query, queryOne } from '../../db/pool';
import { HttpError, notFound } from '../../lib/httpError';

const uuid = z.string().uuid();
const CATEGORIES = [
  'CONTRACT', 'ID', 'INVENTORY', 'INVOICE', 'QUOTE', 'INSURANCE',
  'GUARANTEE', 'LETTER', 'PHOTO', 'PROOF', 'OTHER',
] as const;

export const ALLOWED_DOCUMENT_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'text/plain',
  'text/csv',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

export const MAX_DOCUMENT_BYTES = 10 * 1024 * 1024;

export const createDocumentMetaSchema = z.object({
  propertyId: uuid.optional(),
  tenantId: uuid.optional(),
  leaseId: uuid.optional(),
  category: z.enum(CATEGORIES).default('OTHER'),
  title: z.string().min(1).max(200),
  expiresAt: z.string().date().optional(),
  notes: z.string().max(4000).optional(),
});

function mapDocument(row: Record<string, unknown>) {
  return {
    id: row.id,
    propertyId: row.property_id,
    tenantId: row.tenant_id,
    leaseId: row.lease_id,
    category: row.category,
    title: row.title,
    fileName: row.file_name,
    mimeType: row.mime_type,
    sizeBytes: Number(row.size_bytes),
    documentDate: row.document_date,
    expiresAt: row.expires_at,
    notes: row.notes,
    createdAt: row.created_at,
  };
}

function absPath(storageKey: string): string {
  const root = path.resolve(env.DOCUMENTS_DIR);
  if (!storageKey || storageKey.includes('\0') || path.isAbsolute(storageKey)) {
    throw new HttpError(400, 'Invalid document path');
  }
  const resolved = path.resolve(root, storageKey);
  const relative = path.relative(root, resolved);
  if (!relative || relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new HttpError(400, 'Invalid document path');
  }
  return resolved;
}

async function assertOwned(userId: string, table: 'properties' | 'tenants' | 'leases', id: string): Promise<void> {
  const row = await queryOne<{ id: string }>(`SELECT id FROM ${table} WHERE id = $1 AND user_id = $2`, [id, userId]);
  if (!row) notFound(table === 'properties' ? 'Property' : table === 'tenants' ? 'Tenant' : 'Lease');
}

export async function listDocuments(
  userId: string,
  filters: { propertyId?: string; category?: string } = {},
) {
  const params: unknown[] = [userId];
  const clauses = ['user_id = $1'];
  if (filters.propertyId) {
    params.push(filters.propertyId);
    clauses.push(`property_id = $${params.length}`);
  }
  if (filters.category) {
    params.push(filters.category);
    clauses.push(`category = $${params.length}`);
  }
  const rows = await query<Record<string, unknown>>(
    `SELECT * FROM documents WHERE ${clauses.join(' AND ')} ORDER BY created_at DESC`,
    params,
  );
  return rows.map(mapDocument);
}

export async function getDocument(userId: string, id: string) {
  const row = await queryOne<Record<string, unknown>>(
    'SELECT * FROM documents WHERE id = $1 AND user_id = $2',
    [id, userId],
  );
  if (!row) notFound('Document');
  return mapDocument(row);
}

export async function getDocumentFile(userId: string, id: string) {
  const row = await queryOne<{ storage_key: string; file_name: string; mime_type: string }>(
    'SELECT storage_key, file_name, mime_type FROM documents WHERE id = $1 AND user_id = $2',
    [id, userId],
  );
  if (!row) notFound('Document');
  return {
    absPath: absPath(row.storage_key),
    fileName: row.file_name,
    mimeType: row.mime_type,
  };
}

export async function createDocument(
  userId: string,
  meta: z.infer<typeof createDocumentMetaSchema>,
  file: { buffer: Buffer; originalName: string; mimeType: string },
) {
  if (!ALLOWED_DOCUMENT_TYPES.has(file.mimeType)) {
    throw new HttpError(415, 'This file type is not allowed.');
  }
  if (file.buffer.length === 0 || file.buffer.length > MAX_DOCUMENT_BYTES) {
    throw new HttpError(400, 'File must be between 1 byte and 10 MB.');
  }
  if (meta.propertyId) await assertOwned(userId, 'properties', meta.propertyId);
  if (meta.tenantId) await assertOwned(userId, 'tenants', meta.tenantId);
  if (meta.leaseId) await assertOwned(userId, 'leases', meta.leaseId);

  const id = crypto.randomUUID();
  const ext = path.extname(file.originalName).toLowerCase();
  const safeExt = /^\.[a-z0-9]{1,8}$/.test(ext) ? ext : '';
  const storageKey = `${userId}/${id}${safeExt}`;
  const dest = absPath(storageKey);
  await fs.mkdir(path.dirname(dest), { recursive: true });
  await fs.writeFile(dest, file.buffer);

  try {
    const row = await queryOne<Record<string, unknown>>(
      `INSERT INTO documents (
         id, user_id, property_id, tenant_id, lease_id, category, title, file_name,
         storage_key, mime_type, size_bytes, document_date, expires_at, notes
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,CURRENT_DATE,$12,$13)
       RETURNING *`,
      [
        id,
        userId,
        meta.propertyId ?? null,
        meta.tenantId ?? null,
        meta.leaseId ?? null,
        meta.category,
        meta.title,
        path.basename(file.originalName).slice(0, 200) || 'file',
        storageKey,
        file.mimeType,
        file.buffer.length,
        meta.expiresAt ?? null,
        meta.notes ?? null,
      ],
    );
    if (!row) throw new HttpError(500, 'Unable to save document');
    return mapDocument(row);
  } catch (err) {
    await fs.unlink(dest).catch(() => undefined);
    throw err;
  }
}

export async function deleteDocument(userId: string, id: string) {
  const row = await queryOne<{ storage_key: string }>(
    'SELECT storage_key FROM documents WHERE id = $1 AND user_id = $2',
    [id, userId],
  );
  if (!row) notFound('Document');
  const generated = await queryOne<{ n: string }>(
    'SELECT COUNT(*)::text AS n FROM generated_documents WHERE document_id = $1 AND user_id = $2',
    [id, userId],
  );
  if (Number(generated?.n ?? 0) > 0) {
    throw new HttpError(409, 'This document is linked to a generated record.');
  }
  await queryOne('DELETE FROM documents WHERE id = $1 AND user_id = $2 RETURNING id', [id, userId]);
  await fs.unlink(absPath(row.storage_key)).catch(() => undefined);
}
