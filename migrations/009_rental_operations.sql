-- Rentelyo rental operations foundation.
-- Additive migration: existing properties, leases, payments and receipts are untouched.

CREATE TABLE IF NOT EXISTS lease_tenants (
  lease_id       UUID NOT NULL REFERENCES leases(id) ON DELETE CASCADE,
  tenant_id      UUID NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
  is_primary     BOOLEAN NOT NULL DEFAULT FALSE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (lease_id, tenant_id)
);

CREATE UNIQUE INDEX IF NOT EXISTS lease_tenants_one_primary_idx
  ON lease_tenants (lease_id) WHERE is_primary;

CREATE TABLE IF NOT EXISTS rent_increases (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lease_id         UUID NOT NULL REFERENCES leases(id) ON DELETE RESTRICT,
  old_rent         NUMERIC(12, 2) NOT NULL,
  new_rent         NUMERIC(12, 2) NOT NULL,
  amount           NUMERIC(12, 2),
  percentage       NUMERIC(7, 4),
  effective_date   DATE NOT NULL,
  reason           TEXT,
  calculation      TEXT NOT NULL DEFAULT 'fixed',
  notified_at      DATE,
  document_id      UUID,
  status           TEXT NOT NULL DEFAULT 'DRAFT'
                   CHECK (status IN ('DRAFT', 'PLANNED', 'NOTIFIED', 'APPLIED', 'CANCELLED')),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS rent_increases_user_date_idx
  ON rent_increases (user_id, effective_date);
CREATE INDEX IF NOT EXISTS rent_increases_lease_idx
  ON rent_increases (lease_id);

CREATE TABLE IF NOT EXISTS expenses (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  property_id     UUID NOT NULL REFERENCES properties(id) ON DELETE RESTRICT,
  maintenance_id  UUID,
  category        TEXT NOT NULL CHECK (category IN ('MAINTENANCE', 'REPAIR', 'INSURANCE', 'TAXES', 'CONDO', 'SERVICES', 'MANAGEMENT', 'WORKS', 'BANK_FEES', 'OTHER')),
  label           TEXT NOT NULL,
  amount          NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
  currency        VARCHAR(3) NOT NULL,
  expense_date    DATE NOT NULL,
  vendor          TEXT,
  payment_method  TEXT,
  recurring       BOOLEAN NOT NULL DEFAULT FALSE,
  invoice_path    TEXT,
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS expenses_user_date_idx ON expenses (user_id, expense_date DESC);
CREATE INDEX IF NOT EXISTS expenses_property_idx ON expenses (property_id, expense_date DESC);
CREATE UNIQUE INDEX IF NOT EXISTS expenses_maintenance_once_idx
  ON expenses (maintenance_id) WHERE maintenance_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS maintenance_requests (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  property_id       UUID NOT NULL REFERENCES properties(id) ON DELETE RESTRICT,
  tenant_id         UUID REFERENCES tenants(id) ON DELETE SET NULL,
  title             TEXT NOT NULL,
  description       TEXT,
  category          TEXT NOT NULL DEFAULT 'OTHER',
  priority          TEXT NOT NULL DEFAULT 'NORMAL' CHECK (priority IN ('LOW', 'NORMAL', 'HIGH', 'URGENT')),
  status            TEXT NOT NULL DEFAULT 'NEW' CHECK (status IN ('NEW', 'TO_PLAN', 'PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')),
  scheduled_at      TIMESTAMPTZ,
  provider          TEXT,
  estimated_cost    NUMERIC(12, 2) CHECK (estimated_cost IS NULL OR estimated_cost >= 0),
  actual_cost       NUMERIC(12, 2) CHECK (actual_cost IS NULL OR actual_cost >= 0),
  owner_responsible BOOLEAN NOT NULL DEFAULT TRUE,
  completed_at      TIMESTAMPTZ,
  notes             TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS maintenance_user_status_idx ON maintenance_requests (user_id, status);
CREATE INDEX IF NOT EXISTS maintenance_property_idx ON maintenance_requests (property_id, scheduled_at);

CREATE TABLE IF NOT EXISTS documents (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  property_id     UUID REFERENCES properties(id) ON DELETE RESTRICT,
  tenant_id       UUID REFERENCES tenants(id) ON DELETE RESTRICT,
  lease_id        UUID REFERENCES leases(id) ON DELETE RESTRICT,
  payment_id      UUID REFERENCES payments(id) ON DELETE RESTRICT,
  expense_id      UUID REFERENCES expenses(id) ON DELETE RESTRICT,
  maintenance_id  UUID REFERENCES maintenance_requests(id) ON DELETE RESTRICT,
  category        TEXT NOT NULL CHECK (category IN ('CONTRACT', 'ID', 'INVENTORY', 'INVOICE', 'QUOTE', 'INSURANCE', 'GUARANTEE', 'LETTER', 'PHOTO', 'PROOF', 'OTHER')),
  title           TEXT NOT NULL,
  file_name       TEXT NOT NULL,
  storage_key     TEXT NOT NULL UNIQUE,
  mime_type       TEXT NOT NULL,
  size_bytes      BIGINT NOT NULL CHECK (size_bytes > 0),
  document_date   DATE,
  expires_at      DATE,
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS documents_user_created_idx ON documents (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS documents_expiry_idx ON documents (user_id, expires_at);

CREATE TABLE IF NOT EXISTS generated_documents (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  document_id     UUID NOT NULL UNIQUE REFERENCES documents(id) ON DELETE RESTRICT,
  kind            TEXT NOT NULL,
  reference       TEXT NOT NULL UNIQUE,
  language        TEXT NOT NULL,
  currency        VARCHAR(3) NOT NULL,
  legal_snapshot  JSONB,
  generated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  kind        TEXT NOT NULL,
  title       TEXT NOT NULL,
  body        TEXT NOT NULL,
  entity_type TEXT,
  entity_id   UUID,
  read_at     TIMESTAMPTZ,
  due_at      TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS notifications_user_entity_idx
  ON notifications (user_id, kind, entity_type, entity_id, due_at);
CREATE INDEX IF NOT EXISTS notifications_unread_idx
  ON notifications (user_id, read_at, due_at);

CREATE TABLE IF NOT EXISTS audit_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action      TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id   UUID,
  metadata    JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS audit_logs_user_created_idx
  ON audit_logs (user_id, created_at DESC);
