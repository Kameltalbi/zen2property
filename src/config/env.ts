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
  STRIPE_SECRET_KEY: z.string().optional().default(''),
  STRIPE_PRICE_INVESTOR: z.string().optional().default(''),
  STRIPE_PRICE_PRO: z.string().optional().default(''),
  BOOTSTRAP_ADMIN_EMAIL: z.union([z.literal(''), z.string().email()]).default(''),
});

export const env = schema.parse(process.env);
