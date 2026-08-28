import { z } from 'zod';
import { env } from '../../config/env';
import { query, queryOne } from '../../db/pool';
import { HttpError } from '../../lib/httpError';
import { createLegalProfileVersion, getActiveLegalProfile } from '../legal/legal.service';
import type { LegalRules } from '../../types/domain';

export const proposeSchema = z.object({
  countryCode: z.string().length(2),
  question: z.string().min(8),
});

type DraftRow = {
  id: string;
  country_code: string;
  question: string | null;
  rationale: string | null;
  proposed_rules: LegalRules;
  status: string;
  created_at: string;
};

export async function proposeLegalUpdate(input: z.infer<typeof proposeSchema>) {
  const current = await getActiveLegalProfile(input.countryCode);
  const proposal = await callLegalModel(input.countryCode, input.question, current.rules);

  const draft = await queryOne<DraftRow>(
    `INSERT INTO legal_rule_drafts (country_code, source_profile_id, question, rationale, proposed_rules)
     VALUES ($1, $2, $3, $4, $5::jsonb)
     RETURNING id, country_code, question, rationale, proposed_rules, status, created_at::text`,
    [input.countryCode.toUpperCase(), current.id, input.question, proposal.rationale, JSON.stringify(proposal.rules)],
  );
  if (!draft) throw new HttpError(500, 'Unable to save AI draft');

  return {
    draft: {
      id: draft.id,
      countryCode: draft.country_code.trim(),
      status: draft.status,
      rationale: draft.rationale,
      proposedRules: draft.proposed_rules,
      createdAt: draft.created_at,
    },
    currentRules: current.rules,
  };
}

export async function listDrafts(countryCode?: string) {
  const rows = countryCode
    ? await query<DraftRow>(
        `SELECT id, country_code, question, rationale, proposed_rules, status, created_at::text
         FROM legal_rule_drafts WHERE country_code = $1 ORDER BY created_at DESC`,
        [countryCode.toUpperCase()],
      )
    : await query<DraftRow>(
        `SELECT id, country_code, question, rationale, proposed_rules, status, created_at::text
         FROM legal_rule_drafts ORDER BY created_at DESC LIMIT 50`,
      );
  return rows.map((row) => ({
    id: row.id,
    countryCode: row.country_code.trim(),
    question: row.question,
    rationale: row.rationale,
    proposedRules: row.proposed_rules,
    status: row.status,
    createdAt: row.created_at,
  }));
}

export async function applyDraft(draftId: string) {
  const draft = await queryOne<DraftRow>(
    `SELECT id, country_code, question, rationale, proposed_rules, status, created_at::text
     FROM legal_rule_drafts WHERE id = $1`,
    [draftId],
  );
  if (!draft) throw new HttpError(404, 'Draft not found');
  if (draft.status !== 'pending_review') {
    throw new HttpError(409, `Draft already ${draft.status}`);
  }

  const current = await getActiveLegalProfile(draft.country_code.trim());
  const profile = await createLegalProfileVersion(
    draft.country_code.trim(),
    draft.proposed_rules,
    current.receipt_template_key,
  );

  await queryOne(
    `UPDATE legal_rule_drafts SET status = 'approved', reviewed_at = now() WHERE id = $1 RETURNING id`,
    [draftId],
  );

  return { profile };
}

async function callLegalModel(
  countryCode: string,
  question: string,
  currentRules: LegalRules,
): Promise<{ rationale: string; rules: LegalRules }> {
  if (!env.OPENAI_API_KEY) {
    return {
      rationale:
        'Offline mode: OPENAI_API_KEY is not set. Current rules are returned unchanged. Connect an LLM to propose a JSON patch.',
      rules: currentRules,
    };
  }

  const response = await fetch(`${env.OPENAI_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: env.OPENAI_MODEL,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content:
            'Tu es un assistant juridique locatif. Tu ne modifies jamais un document émis. Tu proposes uniquement un JSON de règles (même schéma que l’entrée). Réponds STRICTEMENT avec { "rationale": string, "rules": object }. Les règles doivent rester déterministes et exploitables par un générateur PDF. Cite la source légale dans rationale.',
        },
        {
          role: 'user',
          content: JSON.stringify({
            countryCode,
            question,
            currentRules,
          }),
        },
      ],
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new HttpError(502, `AI provider failed (${response.status}): ${body.slice(0, 300)}`);
  }

  const json = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = json.choices?.[0]?.message?.content;
  if (!content) throw new HttpError(502, 'Empty AI response');

  const parsed = JSON.parse(content) as { rationale?: string; rules?: LegalRules };
  if (!parsed.rules?.receipt) {
    throw new HttpError(502, 'Invalid AI response: rules.receipt is missing');
  }

  return {
    rationale: parsed.rationale ?? 'Proposition générée sans justification.',
    rules: parsed.rules,
  };
}
