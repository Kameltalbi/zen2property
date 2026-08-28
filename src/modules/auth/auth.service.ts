import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { env } from '../../config/env';
import { queryOne } from '../../db/pool';
import { HttpError } from '../../lib/httpError';
import type { UserRow } from '../../types/domain';

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  fullName: z.string().min(1),
  countryCode: z.string().length(2),
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
});

function publicUser(user: UserRow) {
  return {
    id: user.id,
    email: user.email,
    fullName: user.full_name,
    countryCode: user.country_code.trim(),
    locale: user.locale,
    defaultCurrency: user.default_currency,
    address: user.address,
    bankDetails: user.bank_details,
    receiptSignature: user.receipt_signature,
    plan: user.plan,
    subscriptionStatus: user.subscription_status,
    isAdmin: user.is_admin,
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
  const user = await queryOne<UserRow>(
    `INSERT INTO users (email, password_hash, full_name, country_code, locale, default_currency, address)
     VALUES ($1, $2, $3, $4, $5, COALESCE($6, (SELECT default_currency FROM countries WHERE code = $4)), $7)
     RETURNING *`,
    [
      input.email.toLowerCase(),
      passwordHash,
      input.fullName,
      input.countryCode.toUpperCase(),
      input.locale ?? 'en',
      input.defaultCurrency?.toUpperCase() ?? null,
      input.address ?? null,
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
  const user = await queryOne<UserRow>(
    `UPDATE users SET
       full_name = COALESCE($2, full_name),
       address = COALESCE($3, address),
       bank_details = COALESCE($4, bank_details),
       receipt_signature = COALESCE($5, receipt_signature),
       locale = COALESCE($6, locale),
       default_currency = COALESCE($7, default_currency),
       country_code = COALESCE($8, country_code),
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
