-- Localized SaaS billing: country/market fields + rename INVESTOR → PREMIUM

ALTER TABLE users DROP CONSTRAINT IF EXISTS users_plan_check;

UPDATE users SET plan = 'PREMIUM' WHERE plan = 'INVESTOR';

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS billing_country_code VARCHAR(2),
  ADD COLUMN IF NOT EXISTS billing_region TEXT,
  ADD COLUMN IF NOT EXISTS pricing_market TEXT,
  ADD COLUMN IF NOT EXISTS preferred_currency VARCHAR(3),
  ADD COLUMN IF NOT EXISTS country_updated_at TIMESTAMPTZ;

-- Backfill billing country from residence country
UPDATE users
SET billing_country_code = country_code
WHERE billing_country_code IS NULL;

UPDATE users
SET preferred_currency = default_currency
WHERE preferred_currency IS NULL;

ALTER TABLE users
  ALTER COLUMN plan SET DEFAULT 'FREE',
  ADD CONSTRAINT users_plan_check CHECK (plan IN ('FREE', 'PREMIUM', 'PRO'));

CREATE TABLE IF NOT EXISTS stripe_webhook_events (
  id           TEXT PRIMARY KEY,
  type         TEXT NOT NULL,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  payload      JSONB
);

CREATE TABLE IF NOT EXISTS subscriptions (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id     TEXT,
  plan                   TEXT NOT NULL CHECK (plan IN ('FREE', 'PREMIUM', 'PRO')),
  billing_period         TEXT CHECK (billing_period IN ('monthly', 'yearly')),
  pricing_market         TEXT,
  currency               TEXT,
  status                 TEXT NOT NULL DEFAULT 'none'
    CHECK (status IN ('none', 'trialing', 'active', 'past_due', 'canceled', 'incomplete')),
  current_period_end     TIMESTAMPTZ,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS subscriptions_one_active_per_user
  ON subscriptions (user_id)
  WHERE status IN ('trialing', 'active', 'past_due');
