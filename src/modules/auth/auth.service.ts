import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { env } from '../../config/env';
import { queryOne } from '../../db/pool';
import { HttpError } from '../../lib/httpError';
import type { UserRow } from '../../types/domain';
import { resolvePricingMarket } from '../billing/pricingMarkets';

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  fullName: z.string().min(1),
  countryCode: z.string().length(2),
  billingCountryCode: z.string().length(2).optional(),
  billingRegion: z.string().max(8).optional().nullable(),
  locale: z.string().optional(),
  defaultCurrency: z.string().length(3).optional(),
  address: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const updateMeSchema = z.object({
  fullName: z.string().min(1).optional(),
  address: z.string().optional(),
  bankDetails: z.string().optional(),
  receiptSignature: z.string().optional(),
  locale: z.string().optional(),
  defaultCurrency: z.string().length(3).optional(),
  countryCode: z.string().length(2).optional(),
  billingCountryCode: z.string().length(2).optional(),
  billingRegion: z.string().max(8).optional().nullable(),
});

function publicUser(user: UserRow) {
  const billingCountry = (user.billing_country_code ?? user.country_code).trim();
  const market = resolvePricingMarket(billingCountry);
  return {
    id: user.id,
    email: user.email,
    fullName: user.full_name,
    countryCode: user.country_code.trim(),
    billingCountryCode: billingCountry,
    billingRegion: user.billing_region,
    pricingMarket: user.pricing_market ?? market.id,
    preferredCurrency: user.preferred_currency ?? market.displayCurrency,
    locale: user.locale,
    defaultCurrency: user.default_currency,
    address: user.address,
    bankDetails: user.bank_details,
    receiptSignature: user.receipt_signature,
    plan: user.plan === 'INVESTOR' ? 'PREMIUM' : user.plan === 'PRO' ? 'AGENCY' : user.plan,
    subscriptionStatus: user.subscription_status,
    isAdmin: Boolean(user.is_admin),
    isActive: user.is_active,
    createdAt: user.created_at,
  };
}

function signToken(user: UserRow): string {
  return jwt.sign({ sub: user.id, email: user.email }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
}

export async function register(input: z.infer<typeof registerSchema>) {
  const existing = await queryOne<UserRow>('SELECT id FROM users WHERE email = $1', [input.email.toLowerCase()]);
  if (existing) throw new HttpError(409, 'An account already exists for this email');

  const passwordHash = await bcrypt.hash(input.password, 12);
  const countryCode = input.countryCode.toUpperCase();
  const billingCountry = (input.billingCountryCode ?? countryCode).toUpperCase();
  const market = resolvePricingMarket(billingCountry);
  const region = billingCountry === 'CA' ? (input.billingRegion?.toUpperCase() ?? null) : null;

  const country = await queryOne<{ default_currency: string }>(
    'SELECT default_currency FROM countries WHERE code = $1',
    [countryCode],
  );
  if (!country) throw new HttpError(400, 'Unknown country');

  const user = await queryOne<UserRow>(
    `INSERT INTO users (
       email, password_hash, full_name, country_code, locale, default_currency, address,
       billing_country_code, billing_region, pricing_market, preferred_currency, country_updated_at
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, now())
     RETURNING *`,
    [
      input.email.toLowerCase(),
      passwordHash,
      input.fullName,
      countryCode,
      input.locale ?? 'en',
      input.defaultCurrency?.toUpperCase() ?? country.default_currency,
      input.address ?? null,
      billingCountry,
      region,
      market.id,
      market.displayCurrency,
    ],
  );
  if (!user) throw new HttpError(500, 'Unable to create account');

  if (env.BOOTSTRAP_ADMIN_EMAIL && user.email === env.BOOTSTRAP_ADMIN_EMAIL.toLowerCase()) {
    const promoted = await queryOne<UserRow>(
      'UPDATE users SET is_admin = TRUE, updated_at = now() WHERE id = $1 RETURNING *',
      [user.id],
    );
    if (promoted) return { user: publicUser(promoted), token: signToken(promoted) };
  }

  return { user: publicUser(user), token: signToken(user) };
}

export async function login(input: z.infer<typeof loginSchema>) {
  const user = await queryOne<UserRow>('SELECT * FROM users WHERE email = $1', [input.email.toLowerCase()]);
  if (!user || !(await bcrypt.compare(input.password, user.password_hash))) {
    throw new HttpError(401, 'Invalid credentials');
  }
  if (!user.is_active) throw new HttpError(403, 'This account has been disabled');

  if (env.BOOTSTRAP_ADMIN_EMAIL && user.email === env.BOOTSTRAP_ADMIN_EMAIL.toLowerCase() && !user.is_admin) {
    const promoted = await queryOne<UserRow>(
      'UPDATE users SET is_admin = TRUE, updated_at = now() WHERE id = $1 RETURNING *',
      [user.id],
    );
    if (promoted) return { user: publicUser(promoted), token: signToken(promoted) };
  }

  return { user: publicUser(user), token: signToken(user) };
}

export async function getMe(userId: string) {
  const user = await queryOne<UserRow>('SELECT * FROM users WHERE id = $1', [userId]);
  if (!user) throw new HttpError(404, 'User not found');
  return publicUser(user);
}

export async function updateMe(userId: string, input: z.infer<typeof updateMeSchema>) {
  const billingCountry = input.billingCountryCode?.toUpperCase();
  const market = billingCountry ? resolvePricingMarket(billingCountry) : null;
  const region =
    billingCountry === 'CA'
      ? (input.billingRegion?.toUpperCase() ?? null)
      : billingCountry
        ? null
        : undefined;

  const user = await queryOne<UserRow>(
    `UPDATE users SET
       full_name = COALESCE($2, full_name),
       address = COALESCE($3, address),
       bank_details = COALESCE($4, bank_details),
       receipt_signature = COALESCE($5, receipt_signature),
       locale = COALESCE($6, locale),
       default_currency = COALESCE($7, default_currency),
       country_code = COALESCE($8, country_code),
       billing_country_code = COALESCE($9, billing_country_code),
       billing_region = CASE WHEN $10::boolean THEN $11 ELSE billing_region END,
       pricing_market = COALESCE($12, pricing_market),
       preferred_currency = COALESCE($13, preferred_currency),
       country_updated_at = CASE WHEN $9 IS NOT NULL THEN now() ELSE country_updated_at END,
       updated_at = now()
     WHERE id = $1
     RETURNING *`,
    [
      userId,
      input.fullName ?? null,
      input.address ?? null,
      input.bankDetails ?? null,
      input.receiptSignature ?? null,
      input.locale ?? null,
      input.defaultCurrency?.toUpperCase() ?? null,
      input.countryCode?.toUpperCase() ?? null,
      billingCountry ?? null,
      region !== undefined,
      region ?? null,
      market?.id ?? null,
      market?.displayCurrency ?? null,
    ],
  );
  if (!user) throw new HttpError(404, 'User not found');
  return publicUser(user);
}

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(16),
  password: z.string().min(8),
});

export async function forgotPassword(email: string) {
  const user = await queryOne<UserRow>('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
  const payload: { ok: true; resetToken?: string; resetUrl?: string } = { ok: true };
  if (!user) return payload;

  const token = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  await queryOne(
    `INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
     VALUES ($1, $2, now() + interval '1 hour')
     RETURNING id`,
    [user.id, tokenHash],
  );

  if (env.NODE_ENV !== 'production') {
    payload.resetToken = token;
    payload.resetUrl = `${env.APP_ORIGIN}/reset-password?token=${token}`;
  }
  return payload;
}

export async function resetPassword(token: string, password: string) {
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const row = await queryOne<{ id: string; user_id: string }>(
    `SELECT id, user_id FROM password_reset_tokens
     WHERE token_hash = $1 AND used_at IS NULL AND expires_at > now()`,
    [tokenHash],
  );
  if (!row) throw new HttpError(400, 'This reset link is invalid or has expired');

  const passwordHash = await bcrypt.hash(password, 12);
  await queryOne('UPDATE users SET password_hash = $2, updated_at = now() WHERE id = $1 RETURNING id', [
    row.user_id,
    passwordHash,
  ]);
  await queryOne('UPDATE password_reset_tokens SET used_at = now() WHERE id = $1 RETURNING id', [row.id]);
  return { ok: true };
}
