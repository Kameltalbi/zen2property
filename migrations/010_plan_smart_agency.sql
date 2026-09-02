-- Free / Smart / Premium / Agence

ALTER TABLE users DROP CONSTRAINT IF EXISTS users_plan_check;
ALTER TABLE subscriptions DROP CONSTRAINT IF EXISTS subscriptions_plan_check;

UPDATE users SET plan = 'AGENCY' WHERE plan = 'PRO';
UPDATE subscriptions SET plan = 'AGENCY' WHERE plan = 'PRO';
UPDATE users SET plan = 'PREMIUM' WHERE plan = 'INVESTOR';
UPDATE subscriptions SET plan = 'PREMIUM' WHERE plan = 'INVESTOR';

ALTER TABLE users
  ALTER COLUMN plan SET DEFAULT 'FREE',
  ADD CONSTRAINT users_plan_check CHECK (plan IN ('FREE', 'SMART', 'PREMIUM', 'AGENCY'));

ALTER TABLE subscriptions
  ADD CONSTRAINT subscriptions_plan_check CHECK (plan IN ('FREE', 'SMART', 'PREMIUM', 'AGENCY'));
