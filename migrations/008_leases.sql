CREATE TABLE leases (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  property_id                 UUID NOT NULL REFERENCES properties(id) ON DELETE RESTRICT,
  tenant_id                   UUID NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
  label                       TEXT,
  status                      TEXT NOT NULL DEFAULT 'active'
                                CHECK (status IN ('draft', 'active', 'ended', 'terminated')),
  lease_type                  TEXT NOT NULL DEFAULT 'unfurnished'
                                CHECK (lease_type IN ('furnished', 'unfurnished', 'commercial', 'other')),
  start_date                  DATE NOT NULL,
  end_date                    DATE,
  duration_months             INTEGER,
  notice_period_days          INTEGER NOT NULL DEFAULT 30,
  monthly_rent                NUMERIC(12, 2) NOT NULL,
  monthly_charges             NUMERIC(12, 2) NOT NULL DEFAULT 0,
  currency                    VARCHAR(3) NOT NULL,
  deposit                     NUMERIC(12, 2) NOT NULL DEFAULT 0,
  payment_day                 INTEGER NOT NULL DEFAULT 1
                                CHECK (payment_day BETWEEN 1 AND 31),
  payment_frequency           TEXT NOT NULL DEFAULT 'monthly'
                                CHECK (payment_frequency IN ('monthly', 'quarterly')),
  rent_increase_frequency     TEXT NOT NULL DEFAULT 'yearly'
                                CHECK (rent_increase_frequency IN ('yearly', 'every_2_years', 'every_3_years', 'other', 'none')),
  rent_increase_other_months  INTEGER
                                CHECK (rent_increase_other_months IS NULL OR rent_increase_other_months > 0),
  rent_increase_type          TEXT NOT NULL DEFAULT 'percent'
                                CHECK (rent_increase_type IN ('percent', 'fixed', 'index')),
  rent_increase_value         NUMERIC(12, 4) NOT NULL DEFAULT 0,
  rent_increase_index         TEXT,
  next_increase_date          DATE,
  includes_utilities          BOOLEAN NOT NULL DEFAULT FALSE,
  pets_allowed                BOOLEAN NOT NULL DEFAULT FALSE,
  notes                       TEXT,
  created_at                  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                  TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (end_date IS NULL OR end_date >= start_date)
);

CREATE INDEX leases_user_idx ON leases (user_id);
CREATE INDEX leases_property_idx ON leases (property_id);
CREATE INDEX leases_tenant_idx ON leases (tenant_id);
CREATE INDEX leases_status_idx ON leases (user_id, status);
