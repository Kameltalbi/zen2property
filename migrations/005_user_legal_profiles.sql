ALTER TABLE legal_profiles
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'catalog';

ALTER TABLE legal_profiles
  DROP CONSTRAINT IF EXISTS legal_profiles_status_check;

ALTER TABLE legal_profiles
  ADD CONSTRAINT legal_profiles_status_check
  CHECK (status IN ('catalog', 'pending_review', 'validated'));

ALTER TABLE legal_profiles
  DROP CONSTRAINT IF EXISTS legal_profiles_country_code_version_key;

CREATE UNIQUE INDEX IF NOT EXISTS legal_profiles_catalog_version_idx
  ON legal_profiles (country_code, version)
  WHERE user_id IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS legal_profiles_user_country_idx
  ON legal_profiles (user_id, country_code)
  WHERE user_id IS NOT NULL;

UPDATE legal_profiles SET status = 'catalog' WHERE user_id IS NULL AND status IS DISTINCT FROM 'catalog';

ALTER TABLE legal_rule_drafts
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS locale TEXT NOT NULL DEFAULT 'en';
