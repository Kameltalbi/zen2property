import { DEFAULT_LEGAL_RULES } from '../../data/isoCountries';
import { query, queryOne } from '../../db/pool';
import type { Country, LegalProfile, LegalRules } from '../../types/domain';
import { HttpError, notFound } from '../../lib/httpError';

export async function listCountries(): Promise<Country[]> {
  return query<Country>(
    'SELECT code, name, default_locale, default_currency, is_active FROM countries WHERE is_active = TRUE ORDER BY name',
  );
}

export async function getActiveLegalProfile(countryCode: string): Promise<LegalProfile> {
  const code = countryCode.toUpperCase();
  const profile = await queryOne<LegalProfile>(
    `SELECT id, country_code, version, effective_from::text, rules, receipt_template_key, created_at::text,
            user_id, status
     FROM legal_profiles
     WHERE country_code = $1 AND user_id IS NULL AND effective_from <= CURRENT_DATE
     ORDER BY version DESC
     LIMIT 1`,
    [code],
  );
  if (profile) return profile;

  const created = await queryOne<LegalProfile>(
    `INSERT INTO legal_profiles (country_code, version, effective_from, receipt_template_key, rules, status)
     VALUES ($1, 1, CURRENT_DATE, 'default', $2::jsonb, 'catalog')
     RETURNING id, country_code, version, effective_from::text, rules, receipt_template_key, created_at::text,
               user_id, status`,
    [code, JSON.stringify(DEFAULT_LEGAL_RULES)],
  );
  if (!created) throw new HttpError(404, `No active legal profile for ${countryCode}`);
  return created;
}

export async function getUserLegalProfile(userId: string, countryCode: string): Promise<LegalProfile | null> {
  return queryOne<LegalProfile>(
    `SELECT id, country_code, version, effective_from::text, rules, receipt_template_key, created_at::text,
            user_id, status
     FROM legal_profiles
     WHERE user_id = $1 AND country_code = $2
     ORDER BY version DESC
     LIMIT 1`,
    [userId, countryCode.toUpperCase()],
  );
}

export async function upsertUserLegalProfile(
  userId: string,
  countryCode: string,
  rules: LegalRules,
  status: 'pending_review' | 'validated',
  receiptTemplateKey: string,
): Promise<LegalProfile> {
  const code = countryCode.toUpperCase();
  const existing = await getUserLegalProfile(userId, code);
  if (existing) {
    const updated = await queryOne<LegalProfile>(
      `UPDATE legal_profiles
       SET rules = $3::jsonb, status = $4, effective_from = CURRENT_DATE
       WHERE id = $1 AND user_id = $2
       RETURNING id, country_code, version, effective_from::text, rules, receipt_template_key, created_at::text,
                 user_id, status`,
      [existing.id, userId, JSON.stringify(rules), status],
    );
    if (!updated) throw new HttpError(500, 'Unable to update legal profile');
    return updated;
  }

  const created = await queryOne<LegalProfile>(
    `INSERT INTO legal_profiles (country_code, version, effective_from, rules, receipt_template_key, user_id, status)
     VALUES ($1, 1, CURRENT_DATE, $2::jsonb, $3, $4, $5)
     RETURNING id, country_code, version, effective_from::text, rules, receipt_template_key, created_at::text,
               user_id, status`,
    [code, JSON.stringify(rules), receiptTemplateKey, userId, status],
  );
  if (!created) throw new HttpError(500, 'Unable to save legal profile');
  return created;
}

export async function getLegalProfileById(id: string): Promise<LegalProfile> {
  const profile = await queryOne<LegalProfile>(
    `SELECT id, country_code, version, effective_from::text, rules, receipt_template_key, created_at::text,
            user_id, status
     FROM legal_profiles WHERE id = $1`,
    [id],
  );
  return profile ?? notFound('Legal profile');
}

export function missingReceiptFields(
  rules: LegalRules,
  payload: Record<string, string | number | null | undefined>,
): string[] {
  return rules.receipt.requiredFields.filter((field) => {
    const value = payload[field];
    return value === null || value === undefined || value === '';
  });
}

export async function createLegalProfileVersion(
  countryCode: string,
  rules: LegalRules,
  receiptTemplateKey: string,
): Promise<LegalProfile> {
  const latest = await queryOne<{ version: number }>(
    'SELECT version FROM legal_profiles WHERE country_code = $1 AND user_id IS NULL ORDER BY version DESC LIMIT 1',
    [countryCode.toUpperCase()],
  );
  const version = (latest?.version ?? 0) + 1;
  const created = await queryOne<LegalProfile>(
    `INSERT INTO legal_profiles (country_code, version, effective_from, rules, receipt_template_key, status)
     VALUES ($1, $2, CURRENT_DATE, $3::jsonb, $4, 'catalog')
     RETURNING id, country_code, version, effective_from::text, rules, receipt_template_key, created_at::text,
               user_id, status`,
    [countryCode.toUpperCase(), version, JSON.stringify(rules), receiptTemplateKey],
  );
  if (!created) throw new HttpError(500, 'Unable to create legal profile');
  return created;
}
