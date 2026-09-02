import path from 'node:path';
import fs from 'node:fs';
import { z } from 'zod';
import { env } from '../../config/env';
import { pool, query, queryOne } from '../../db/pool';
import { HttpError, notFound } from '../../lib/httpError';
import { sendEmail } from '../../lib/mail';
import { getActiveLegalProfile, getUserLegalProfile, missingReceiptFields } from '../legal/legal.service';
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

  const userProfile = await getUserLegalProfile(userId, property.country_code.trim());
  const catalog = await getActiveLegalProfile(property.country_code.trim());
  const active = userProfile?.status === 'validated' ? userProfile : catalog;
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

  const missing = missingReceiptFields(active.rules, fieldPayload);
  if (missing.length > 0) {
    throw new HttpError(
      422,
      `Missing required legal fields for ${property.country_code.trim()}: ${missing.join(', ')}`,
    );
  }

  const receiptId = crypto.randomUUID();
  const pdfPath = path.resolve(env.RECEIPTS_DIR, userId, `${receiptId}.pdf`);
  const temporaryPdfPath = `${pdfPath}.tmp`;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    // Serialize issuance per landlord so payment and receipt uniqueness checks cannot race.
    await client.query('SELECT pg_advisory_xact_lock(hashtextextended($1, 0))', [userId]);
    const duplicate = await client.query<ReceiptRow>(
      'SELECT * FROM receipts WHERE payment_id = $1 AND user_id = $2',
      [paymentId, userId],
    );
    if (duplicate.rows[0]) {
      await client.query('COMMIT');
      return mapReceipt(duplicate.rows[0]);
    }

    const prefix = active.rules.receipt.numbering.prefix;
    const year = new Date().getFullYear();
    const last = await client.query<{ number: string }>(
      `SELECT number FROM receipts WHERE user_id = $1 AND number LIKE $2
       ORDER BY number DESC LIMIT 1`,
      [userId, `${prefix}-${year}-%`],
    );
    const seq = last.rows[0] ? Number(last.rows[0].number.split('-').at(-1)) + 1 : 1;
    const number = `${prefix}-${year}-${String(seq).padStart(4, '0')}`;

    await renderReceiptPdf(temporaryPdfPath, {
      title: active.rules.receipt.title, number, landlordName: user.full_name,
      landlordAddress: user.address ?? '', tenantName, propertyName: property.name,
      propertyAddress: property.address, periodStart: isoDate(payment.period_start),
      periodEnd: isoDate(payment.period_end), paymentDate: isoDate(payment.paid_date),
      rentAmount, chargesAmount, totalAmount: Number(payment.amount), currency: payment.currency,
      method: payment.method, legalNotice: active.rules.receipt.legalNotice,
      splitRentAndCharges: active.rules.receipt.splitRentAndCharges,
      signature: user.receipt_signature, countryCode: property.country_code.trim(),
    }, active.rules);
    await fs.promises.rename(temporaryPdfPath, pdfPath);

    const inserted = await client.query<ReceiptRow>(
      `INSERT INTO receipts (id, user_id, payment_id, number, legal_profile_id, legal_snapshot, pdf_path)
       VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7) RETURNING *`,
      [receiptId, userId, paymentId, number, active.id, JSON.stringify(active.rules), pdfPath],
    );
    await client.query('COMMIT');
    return mapReceipt(inserted.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK').catch(() => undefined);
    await Promise.all([
      fs.promises.unlink(temporaryPdfPath).catch(() => undefined),
      fs.promises.unlink(pdfPath).catch(() => undefined),
    ]);
    throw err;
  } finally {
    client.release();
  }
}

function isoDate(value: string): string {
  return value.slice(0, 10);
}

export const emailReceiptSchema = z.object({
  to: z.string().email().optional(),
});

export async function emailReceipt(
  userId: string,
  receiptId: string,
  input: { to?: string } = {},
) {
  const receipt = await getReceipt(userId, receiptId);
  const payment = await getPaymentRow(userId, receipt.payment_id);
  const tenant = payment.tenant_id
    ? await queryOne<TenantRow>('SELECT * FROM tenants WHERE id = $1 AND user_id = $2', [
        payment.tenant_id,
        userId,
      ])
    : null;
  const to = (input.to ?? tenant?.email ?? '').trim().toLowerCase();
  if (!to) {
    throw new HttpError(400, 'Add a tenant email, or specify a recipient.');
  }

  const pdf = await fs.promises.readFile(receipt.pdf_path);
  const landlord = await queryOne<UserRow>('SELECT full_name FROM users WHERE id = $1', [userId]);
  const landlordName = landlord?.full_name ?? 'Rentelyo';
  const period = `${isoDate(payment.period_start)} – ${isoDate(payment.period_end)}`;

  await sendEmail({
    to,
    subject: `Quittance ${receipt.number}`,
    html:
      `<p>Bonjour,</p>` +
      `<p>${landlordName} vous envoie la quittance <strong>${receipt.number}</strong> pour la période ${period}.</p>` +
      `<p>Le PDF est joint à cet e-mail.</p>` +
      `<p>— Rentelyo</p>`,
    text: `${landlordName} vous envoie la quittance ${receipt.number} pour la période ${period}. Le PDF est joint.`,
    attachments: [
      {
        filename: `quittance-${receipt.number}.pdf`,
        content: pdf,
        contentType: 'application/pdf',
      },
    ],
  });

  return { ok: true as const, to, number: receipt.number };
}
