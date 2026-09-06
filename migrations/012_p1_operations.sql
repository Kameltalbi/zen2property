-- P1: lease-linked rent periods, reminder preferences.

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS rent_reminders_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS lease_expiry_reminders_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS lease_expiry_warning_days INTEGER NOT NULL DEFAULT 60;

ALTER TABLE users DROP CONSTRAINT IF EXISTS users_lease_expiry_warning_days_check;
ALTER TABLE users
  ADD CONSTRAINT users_lease_expiry_warning_days_check
  CHECK (lease_expiry_warning_days >= 7 AND lease_expiry_warning_days <= 180);

ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS lease_id UUID REFERENCES leases(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS payments_lease_idx ON payments (lease_id);

CREATE UNIQUE INDEX IF NOT EXISTS payments_auto_period_uidx
  ON payments (user_id, lease_id, period_start)
  WHERE lease_id IS NOT NULL;
