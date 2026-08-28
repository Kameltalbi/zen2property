import fs from 'node:fs';
import path from 'node:path';
import { ISO_COUNTRIES, DEFAULT_LEGAL_RULES } from '../data/isoCountries';
import { pool } from './pool';

async function seedIsoCountries(): Promise<void> {
  for (const country of ISO_COUNTRIES) {
    await pool.query(
      `INSERT INTO countries (code, name, default_locale, default_currency)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (code) DO UPDATE SET
         name = EXCLUDED.name,
         default_locale = EXCLUDED.default_locale,
         default_currency = EXCLUDED.default_currency`,
      [country.code, country.name, country.locale, country.currency],
    );
  }

  const inserted = await pool.query(
    `INSERT INTO legal_profiles (country_code, version, effective_from, receipt_template_key, rules)
     SELECT c.code, 1, DATE '2024-01-01', 'default', $1::jsonb
     FROM countries c
     WHERE NOT EXISTS (
       SELECT 1 FROM legal_profiles lp WHERE lp.country_code = c.code
     )`,
    [JSON.stringify(DEFAULT_LEGAL_RULES)],
  );
  console.log(`iso countries ${ISO_COUNTRIES.length}; default legal profiles +${inserted.rowCount ?? 0}`);
}

async function migrate(): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);

  const dir = path.resolve(__dirname, '../../migrations');
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.sql')).sort();

  for (const file of files) {
    const already = await pool.query('SELECT 1 FROM schema_migrations WHERE id = $1', [file]);
    if ((already.rowCount ?? 0) > 0) {
      console.log(`skip  ${file}`);
      continue;
    }

    const sql = fs.readFileSync(path.join(dir, file), 'utf8');
    await pool.query('BEGIN');
    try {
      await pool.query(sql);
      await pool.query('INSERT INTO schema_migrations (id) VALUES ($1)', [file]);
      await pool.query('COMMIT');
      console.log(`apply ${file}`);
    } catch (err) {
      await pool.query('ROLLBACK');
      throw err;
    }
  }

  await seedIsoCountries();
}

migrate()
  .then(async () => {
    console.log('migrations ok');
    await pool.end();
  })
  .catch(async (err) => {
    console.error(err);
    await pool.end();
    process.exit(1);
  });
