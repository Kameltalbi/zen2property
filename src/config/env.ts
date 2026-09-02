import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const schema = z.object({
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(16),
  JWT_EXPIRES_IN: z.string().default('7d'),
  OPENAI_API_KEY: z.string().optional().default(''),
  OPENAI_MODEL: z.string().default('gpt-4o-mini'),
  OPENAI_BASE_URL: z.string().default('https://api.openai.com/v1'),
  RECEIPTS_DIR: z.string().default('./storage/receipts'),
  APP_ORIGIN: z.string().default('http://localhost:5173'),
  HOST: z.string().default('0.0.0.0'),
  STRIPE_SECRET_KEY: z.string().optional().default(''),
  STRIPE_WEBHOOK_SECRET: z.string().optional().default(''),
  STRIPE_TAX_ENABLED: z
    .string()
    .optional()
    .default('false')
    .transform((v) => v === 'true' || v === '1'),
  // Legacy single-price env (ignored when multi-currency keys are set)
  STRIPE_PRICE_INVESTOR: z.string().optional().default(''),
  STRIPE_PRICE_PRO: z.string().optional().default(''),
  STRIPE_PRICE_SMART_MONTHLY_CAD: z.string().optional().default(''),
  STRIPE_PRICE_SMART_YEARLY_CAD: z.string().optional().default(''),
  STRIPE_PRICE_PREMIUM_MONTHLY_CAD: z.string().optional().default(''),
  STRIPE_PRICE_PREMIUM_YEARLY_CAD: z.string().optional().default(''),
  STRIPE_PRICE_PRO_MONTHLY_CAD: z.string().optional().default(''),
  STRIPE_PRICE_PRO_YEARLY_CAD: z.string().optional().default(''),
  STRIPE_PRICE_SMART_MONTHLY_USD: z.string().optional().default(''),
  STRIPE_PRICE_SMART_YEARLY_USD: z.string().optional().default(''),
  STRIPE_PRICE_PREMIUM_MONTHLY_USD: z.string().optional().default(''),
  STRIPE_PRICE_PREMIUM_YEARLY_USD: z.string().optional().default(''),
  STRIPE_PRICE_PRO_MONTHLY_USD: z.string().optional().default(''),
  STRIPE_PRICE_PRO_YEARLY_USD: z.string().optional().default(''),
  STRIPE_PRICE_SMART_MONTHLY_EUR: z.string().optional().default(''),
  STRIPE_PRICE_SMART_YEARLY_EUR: z.string().optional().default(''),
  STRIPE_PRICE_PREMIUM_MONTHLY_EUR: z.string().optional().default(''),
  STRIPE_PRICE_PREMIUM_YEARLY_EUR: z.string().optional().default(''),
  STRIPE_PRICE_PRO_MONTHLY_EUR: z.string().optional().default(''),
  STRIPE_PRICE_PRO_YEARLY_EUR: z.string().optional().default(''),
  BOOTSTRAP_ADMIN_EMAIL: z.union([z.literal(''), z.string().email()]).default(''),
  RESEND_API_KEY: z.string().optional().default(''),
  EMAIL_FROM: z.union([z.literal(''), z.string().email()]).default(''),
}).superRefine((value, ctx) => {
  if (value.NODE_ENV === 'production' && (!value.RESEND_API_KEY || !value.EMAIL_FROM)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'RESEND_API_KEY and EMAIL_FROM are required in production',
      path: ['RESEND_API_KEY'],
    });
  }
});

export const env = schema.parse(process.env);

export function stripePriceIdFromEnv(envKey: string): string {
  const value = (process.env[envKey] ?? '').trim();
  return value;
}
