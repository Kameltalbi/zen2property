CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE countries (
  code             VARCHAR(2) PRIMARY KEY,
  name             TEXT NOT NULL,
  default_locale   TEXT NOT NULL,
  default_currency VARCHAR(3) NOT NULL,
  is_active        BOOLEAN NOT NULL DEFAULT TRUE
);

-- Une version de règles légales par pays. Le runtime utilise toujours
-- la version la plus récente dont effective_from <= CURRENT_DATE.
CREATE TABLE legal_profiles (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code         VARCHAR(2) NOT NULL REFERENCES countries(code),
  version              INTEGER NOT NULL,
  effective_from       DATE NOT NULL,
  rules                JSONB NOT NULL,
  receipt_template_key TEXT NOT NULL DEFAULT 'default',
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (country_code, version)
);

CREATE INDEX legal_profiles_country_effective_idx
  ON legal_profiles (country_code, effective_from DESC);

CREATE TABLE users (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email             TEXT NOT NULL UNIQUE,
  password_hash     TEXT NOT NULL,
  full_name         TEXT NOT NULL,
  country_code      VARCHAR(2) NOT NULL REFERENCES countries(code),
  locale            TEXT NOT NULL DEFAULT 'fr',
  default_currency  VARCHAR(3) NOT NULL DEFAULT 'EUR',
  address           TEXT,
  bank_details      TEXT,
  receipt_signature TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE properties (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name             TEXT NOT NULL,
  address          TEXT NOT NULL,
  city             TEXT,
  postal_code      TEXT,
  country_code     VARCHAR(2) NOT NULL REFERENCES countries(code),
  surface          NUMERIC(10, 2),
  type             TEXT NOT NULL CHECK (type IN ('APARTMENT', 'HOUSE', 'STUDIO', 'OTHER')),
  monthly_rent     NUMERIC(12, 2),
  monthly_charges  NUMERIC(12, 2) NOT NULL DEFAULT 0,
  currency         VARCHAR(3) NOT NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX properties_user_idx ON properties (user_id);

CREATE TABLE tenants (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  property_id   UUID NOT NULL REFERENCES properties(id) ON DELETE RESTRICT,
  first_name    TEXT NOT NULL,
  last_name     TEXT NOT NULL,
  email         TEXT,
  phone         TEXT,
  move_in_date  DATE NOT NULL,
  move_out_date DATE,
  deposit       NUMERIC(12, 2) NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX tenants_user_idx ON tenants (user_id);
CREATE INDEX tenants_property_idx ON tenants (property_id);

CREATE TABLE payments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  property_id     UUID NOT NULL REFERENCES properties(id) ON DELETE RESTRICT,
  tenant_id       UUID REFERENCES tenants(id) ON DELETE SET NULL,
  amount          NUMERIC(12, 2) NOT NULL,
  rent_amount     NUMERIC(12, 2),
  charges_amount  NUMERIC(12, 2),
  currency        VARCHAR(3) NOT NULL,
  period_start    DATE NOT NULL,
  period_end      DATE NOT NULL,
  due_date        DATE NOT NULL,
  paid_date       DATE,
  status          TEXT NOT NULL CHECK (status IN ('PAID', 'PENDING', 'LATE', 'PARTIAL')),
  method          TEXT CHECK (method IN ('BANK_TRANSFER', 'CHECK', 'CASH', 'OTHER')),
  description     TEXT,
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX payments_user_due_idx ON payments (user_id, due_date DESC);
CREATE INDEX payments_property_idx ON payments (property_id);

CREATE TABLE receipts (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  payment_id        UUID NOT NULL UNIQUE REFERENCES payments(id) ON DELETE RESTRICT,
  number            TEXT NOT NULL,
  legal_profile_id  UUID NOT NULL REFERENCES legal_profiles(id),
  legal_snapshot    JSONB NOT NULL,
  pdf_path          TEXT NOT NULL,
  issued_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, number)
);

CREATE INDEX receipts_user_idx ON receipts (user_id);

-- Propositions IA : jamais appliquées automatiquement.
CREATE TABLE legal_rule_drafts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code    VARCHAR(2) NOT NULL REFERENCES countries(code),
  source_profile_id UUID REFERENCES legal_profiles(id),
  question        TEXT,
  rationale       TEXT,
  proposed_rules  JSONB NOT NULL,
  status          TEXT NOT NULL DEFAULT 'pending_review'
                    CHECK (status IN ('pending_review', 'approved', 'rejected')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at     TIMESTAMPTZ
);
