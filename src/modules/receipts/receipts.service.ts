import path from 'node:path';
import { env } from '../../config/env';
import { query, queryOne } from '../../db/pool';
import { HttpError, notFound } from '../../lib/httpError';
import { getActiveLegalProfile, missingReceiptFields } from '../legal/legal.service';
import { getPaymentRow } from '../payments/payments.service';
import type { PropertyRow, ReceiptRow, TenantRow, UserRow } from '../../types/domain';
import { renderReceiptPdf } from './receipt.renderer';

function mapReceipt(row: ReceiptRow) {
  return {
    id: row.id,
    paymentId: row.payment_id,
    number: row.number,
    legalProfileId: row.legal_profile_id,
    issuedAt: row.issued_at,
  };
}

export async function listReceipts(userId: string) {
  const rows = await query<ReceiptRow>(
    'SELECT * FROM receipts WHERE user_id = $1 ORDER BY issued_at DESC',
    [userId],
  );
  return rows.map(mapReceipt);
}

export async function getReceipt(userId: string, id: string) {
  const row = await queryOne<ReceiptRow>('SELECT * FROM receipts WHERE id = $1 AND user_id = $2', [id, userId]);
  if (!row) notFound('Receipt');
  return row;
}

export async function issueReceipt(userId: string, paymentId: string) {
  const existing = await queryOne<ReceiptRow>(
    'SELECT * FROM receipts WHERE payment_id = $1 AND user_id = $2',
    [paymentId, userId],
  );
  if (existing) return mapReceipt(existing);

  const payment = await getPaymentRow(userId, paymentId);
  if (payment.status !== 'PAID' || !payment.paid_date) {
    throw new HttpError(409, 'A receipt can only be issued for a paid payment');
  }

  const [user, property, tenant] = await Promise.all([
    queryOne<UserRow>('SELECT * FROM users WHERE id = $1', [userId]),
    queryOne<PropertyRow>('SELECT * FROM properties WHERE id = $1 AND user_id = $2', [payment.property_id, userId]),
    payment.tenant_id
      ? queryOne<TenantRow>('SELECT * FROM tenants WHERE id = $1 AND user_id = $2', [payment.tenant_id, userId])
      : Promise.resolve(null),
  ]);
  if (!user || !property) throw new HttpError(404, 'Landlord or property data is missing');

  const profile = await getActiveLegalProfile(property.country_code.trim());
  const tenantName = tenant ? `${tenant.first_name} ${tenant.last_name}` : '';
  const rentAmount = payment.rent_amount === null ? Number(payment.amount) : Number(payment.rent_amount);
  const chargesAmount = payment.charges_amount === null ? 0 : Number(payment.charges_amount);

  const fieldPayload: Record<string, string | number | null> = {
    landlordName: user.full_name,
    landlordAddress: user.address,
    tenantName,
    propertyAddress: property.address,
    periodStart: payment.period_start,
    periodEnd: payment.period_end,
    rentAmount,
    chargesAmount,
    totalAmount: Number(payment.amount),
    paymentDate: payment.paid_date,
  };

  const missing = missingReceiptFields(profile.rules, fieldPayload);
  if (missing.length > 0) {
    throw new HttpError(
      422,
      `Missing required legal fields for ${property.country_code.trim()}: ${missing.join(', ')}`,
    );
  }

  const number = await nextReceiptNumber(userId, profile.rules.receipt.numbering.prefix);
  const receiptId = crypto.randomUUID();
  const pdfPath = path.resolve(env.RECEIPTS_DIR, userId, `${receiptId}.pdf`);

  await renderReceiptPdf(pdfPath, {
    title: profile.rules.receipt.title,
    number,
    landlordName: user.full_name,
    landlordAddress: user.address ?? '',
    tenantName,
    propertyName: property.name,
    propertyAddress: property.address,
    periodStart: isoDate(payment.period_start),
    periodEnd: isoDate(payment.period_end),
    paymentDate: isoDate(payment.paid_date),
    rentAmount,
    chargesAmount,
    totalAmount: Number(payment.amount),
    currency: payment.currency,
    method: payment.method,
    legalNotice: profile.rules.receipt.legalNotice,
    splitRentAndCharges: profile.rules.receipt.splitRentAndCharges,
    signature: user.receipt_signature,
    countryCode: property.country_code.trim(),
  }, profile.rules);

  const row = await queryOne<ReceiptRow>(
    `INSERT INTO receipts (id, user_id, payment_id, number, legal_profile_id, legal_snapshot, pdf_path)
     VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7)
     RETURNING *`,
    [receiptId, userId, paymentId, number, profile.id, JSON.stringify(profile.rules), pdfPath],
  );
  if (!row) throw new HttpError(500, 'Unable to save receipt');
  return mapReceipt(row);
}

async function nextReceiptNumber(userId: string, prefix: string): Promise<string> {
  const year = new Date().getFullYear();
  const like = `${prefix}-${year}-%`;
  const last = await queryOne<{ number: string }>(
    `SELECT number FROM receipts
     WHERE user_id = $1 AND number LIKE $2
     ORDER BY number DESC LIMIT 1`,
    [userId, like],
  );
  const seq = last ? Number(last.number.split('-').at(-1)) + 1 : 1;
  return `${prefix}-${year}-${String(seq).padStart(4, '0')}`;
}

function isoDate(value: string): string {
  return value.slice(0, 10);
}
