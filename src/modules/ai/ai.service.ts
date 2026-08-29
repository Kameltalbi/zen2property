import { z } from 'zod';
import { env } from '../../config/env';
import { query, queryOne } from '../../db/pool';
import { HttpError } from '../../lib/httpError';
import {
  createLegalProfileVersion,
  getActiveLegalProfile,
  getUserLegalProfile,
  upsertUserLegalProfile,
} from '../legal/legal.service';
import type { LegalRules } from '../../types/domain';
import { LEGAL_SYSTEM_PROMPT } from './legalPrompt';

export const proposeSchema = z.object({
  countryCode: z.string().length(2),
  locale: z.enum(['en', 'fr']).default('en'),
  question: z.string().min(8).optional(),
});

const b2bWithholdingSchema = z
  .object({
    enabled: z.boolean().default(false),
    rate_percent: z.number().min(0).max(100).default(0),
    withheld_by: z.enum(['tenant', 'landlord']).default('tenant'),
    remitted_to_tax_authority: z.boolean().default(true),
    attestation_name: z.string().default(''),
    note: z.string().default(''),
  })
  .optional();

const taxRulesSchema = z.object({
  vat_applicable: z.boolean(),
  default_tax_rate: z.number(),
  tax_id_label: z.string().min(1),
  b2b_withholding: b2bWithholdingSchema,
});

export const legalProfilePayloadSchema = z.object({
  tax_rules: taxRulesSchema,
  required_documents: z.array(
    z.object({
      doc_type: z.string().min(1),
      description: z.string(),
      is_mandatory: z.boolean(),
    }),
  ),
  mandatory_mentions: z.array(z.string()),
  user_review_prompt_message: z.string().optional(),
});

export const confirmDraftSchema = legalProfilePayloadSchema;

export const saveManualSchema = legalProfilePayloadSchema.extend({
  countryCode: z.string().length(2),
  locale: z.enum(['en', 'fr']).default('en'),
});

const aiPayloadSchema = z.object({
  country_code: z.string().min(2),
  tax_rules: taxRulesSchema.extend({
    tax_id_label: z.string(),
  }),
  required_documents: z.array(
    z.object({
      doc_type: z.string(),
      description: z.string(),
      is_mandatory: z.boolean(),
    }),
  ),
  mandatory_mentions: z.array(z.string()),
  user_review_prompt_message: z.string(),
});

type DraftRow = {
  id: string;
  country_code: string;
  question: string | null;
  rationale: string | null;
  proposed_rules: LegalRules;
  status: string;
  created_at: string;
  user_id: string | null;
  locale: string;
};

function mapDraft(draft: DraftRow) {
  return {
    id: draft.id,
    countryCode: draft.country_code.trim(),
    status: draft.status,
    locale: draft.locale,
    rationale: draft.rationale,
    reviewMessage: draft.proposed_rules.userReviewPromptMessage ?? draft.rationale,
    proposedRules: draft.proposed_rules,
    taxRules: draft.proposed_rules.tax,
    requiredDocuments: draft.proposed_rules.requiredDocuments ?? [],
    mandatoryMentions: draft.proposed_rules.mandatoryMentions ?? [],
    createdAt: draft.created_at,
  };
}

export function mergeProposalIntoRules(
  current: LegalRules,
  payload: z.infer<typeof aiPayloadSchema> | z.infer<typeof legalProfilePayloadSchema>,
  countryCode: string,
): LegalRules {
  const tax = payload.tax_rules;
  const docs = payload.required_documents;
  const mentions = payload.mandatory_mentions;
  const review =
    'user_review_prompt_message' in payload ? payload.user_review_prompt_message : current.userReviewPromptMessage;
  const receiptTitle =
    docs.find((d) => /receipt|quittance/i.test(d.doc_type))?.doc_type ?? current.receipt.title;
  return {
    ...current,
    receipt: {
      ...current.receipt,
      title: receiptTitle,
      splitRentAndCharges: countryCode.toUpperCase() === 'FR' || current.receipt.splitRentAndCharges,
      legalNotice: mentions.filter(Boolean).join('\n') || current.receipt.legalNotice,
    },
    tax,
    requiredDocuments: docs,
    mandatoryMentions: mentions,
    userReviewPromptMessage: review,
  };
}

/** Landlord saves taxes / documents for their country without using AI. */
export async function saveManualLegalProfile(userId: string, input: z.infer<typeof saveManualSchema>) {
  const catalog = await getActiveLegalProfile(input.countryCode);
  const review =
    input.user_review_prompt_message?.trim() ||
    (input.locale === 'fr'
      ? `Profil légal défini manuellement pour ${input.countryCode.toUpperCase()}.`
      : `Legal profile set manually for ${input.countryCode.toUpperCase()}.`);
  const rules = mergeProposalIntoRules(
    catalog.rules,
    { ...input, user_review_prompt_message: review },
    input.countryCode,
  );

  const profile = await upsertUserLegalProfile(
    userId,
    input.countryCode,
    rules,
    'validated',
    catalog.receipt_template_key,
  );

  await query(
    `UPDATE legal_rule_drafts
     SET status = 'rejected', reviewed_at = now()
     WHERE user_id = $1 AND country_code = $2 AND status = 'pending_review'`,
    [userId, input.countryCode.toUpperCase()],
  );

  return { profile };
}

export async function proposeLegalUpdate(userId: string, input: z.infer<typeof proposeSchema>) {
  const current = await getActiveLegalProfile(input.countryCode);
  const proposal = await callLegalModel(
    input.countryCode,
    input.locale,
    input.question ??
      `Generate the full legal, tax and document profile for landlords in ${input.countryCode}.`,
    current.rules,
  );
  const rules = mergeProposalIntoRules(current.rules, proposal, input.countryCode);

  const draft = await queryOne<DraftRow>(
    `INSERT INTO legal_rule_drafts (country_code, source_profile_id, question, rationale, proposed_rules, user_id, locale)
     VALUES ($1, $2, $3, $4, $5::jsonb, $6, $7)
     RETURNING id, country_code, question, rationale, proposed_rules, status, created_at::text, user_id, locale`,
    [
      input.countryCode.toUpperCase(),
      current.id,
      input.question ?? 'Generate legal profile',
      proposal.user_review_prompt_message,
      JSON.stringify(rules),
      userId,
      input.locale,
    ],
  );
  if (!draft) throw new HttpError(500, 'Unable to save AI draft');

  await upsertUserLegalProfile(userId, input.countryCode, rules, 'pending_review', current.receipt_template_key);

  return {
    draft: mapDraft(draft),
    currentRules: current.rules,
  };
}

export async function listDrafts(userId: string, isAdmin: boolean, countryCode?: string) {
  const rows = isAdmin
    ? countryCode
      ? await query<DraftRow>(
          `SELECT id, country_code, question, rationale, proposed_rules, status, created_at::text, user_id, locale
           FROM legal_rule_drafts WHERE country_code = $1 ORDER BY created_at DESC`,
          [countryCode.toUpperCase()],
        )
      : await query<DraftRow>(
          `SELECT id, country_code, question, rationale, proposed_rules, status, created_at::text, user_id, locale
           FROM legal_rule_drafts ORDER BY created_at DESC LIMIT 50`,
        )
    : await query<DraftRow>(
        `SELECT id, country_code, question, rationale, proposed_rules, status, created_at::text, user_id, locale
         FROM legal_rule_drafts WHERE user_id = $1 AND ($2::text IS NULL OR country_code = $2)
         ORDER BY created_at DESC`,
        [userId, countryCode ? countryCode.toUpperCase() : null],
      );
  return rows.map(mapDraft);
}

export async function confirmDraft(userId: string, draftId: string, edits: z.infer<typeof confirmDraftSchema>) {
  const draft = await queryOne<DraftRow>(
    `SELECT id, country_code, question, rationale, proposed_rules, status, created_at::text, user_id, locale
     FROM legal_rule_drafts WHERE id = $1`,
    [draftId],
  );
  if (!draft) throw new HttpError(404, 'Draft not found');
  if (draft.user_id && draft.user_id !== userId) throw new HttpError(403, 'This draft belongs to another account');
  if (draft.status !== 'pending_review') {
    throw new HttpError(409, `Draft already ${draft.status}`);
  }

  const catalog = await getActiveLegalProfile(draft.country_code.trim());
  const rules = mergeProposalIntoRules(draft.proposed_rules, edits, draft.country_code.trim());
  const profile = await upsertUserLegalProfile(
    userId,
    draft.country_code.trim(),
    rules,
    'validated',
    catalog.receipt_template_key,
  );

  await queryOne(
    `UPDATE legal_rule_drafts SET status = 'approved', rationale = $2, proposed_rules = $3::jsonb, reviewed_at = now()
     WHERE id = $1 RETURNING id`,
    [draftId, rules.userReviewPromptMessage ?? draft.rationale, JSON.stringify(rules)],
  );

  return { profile, draft: { ...mapDraft(draft), status: 'approved', proposedRules: rules } };
}

export async function applyDraft(draftId: string) {
  const draft = await queryOne<DraftRow>(
    `SELECT id, country_code, question, rationale, proposed_rules, status, created_at::text, user_id, locale
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

export async function getMyLegalState(userId: string, countryCode: string) {
  const catalog = await getActiveLegalProfile(countryCode);
  const confirmed = await getUserLegalProfile(userId, countryCode);
  const drafts = await listDrafts(userId, false, countryCode);
  const pending = drafts.find((d) => d.status === 'pending_review') ?? null;
  return { catalog, confirmed, pendingDraft: pending };
}

function offlineProposal(countryCode: string, locale: 'en' | 'fr'): z.infer<typeof aiPayloadSchema> {
  const fr = locale === 'fr';
  const code = countryCode.toUpperCase();
  const tnB2b =
    code === 'TN'
      ? {
          enabled: true,
          rate_percent: 15,
          withheld_by: 'tenant' as const,
          remitted_to_tax_authority: true,
          attestation_name: fr ? 'Attestation de RS' : 'Withholding (RS) certificate',
          note: fr
            ? 'En location B2B, le locataire retient 15 % du loyer, le verse au fisc et envoie une attestation de RS au propriétaire.'
            : 'For B2B rentals, the tenant withholds 15% of rent, remits it to the tax authority, and sends an RS certificate to the landlord.',
        }
      : undefined;

  return {
    country_code: countryCode,
    tax_rules: {
      vat_applicable: false,
      default_tax_rate: 0,
      tax_id_label: fr ? 'N° fiscal / TVA' : 'Tax ID / VAT number',
      ...(tnB2b ? { b2b_withholding: tnB2b } : {}),
    },
    required_documents: [
      {
        doc_type: fr ? 'Quittance de loyer' : 'Rent receipt',
        description: fr
          ? 'Justificatif du loyer payé pour la période indiquée.'
          : 'Proof of rent paid for the stated period.',
        is_mandatory: true,
      },
      {
        doc_type: fr ? 'État des lieux' : 'Inventory of fixtures',
        description: fr
          ? 'Constat d’entrée et de sortie du logement.'
          : 'Check-in and check-out condition report.',
        is_mandatory: code === 'FR',
      },
      {
        doc_type: fr ? 'Bail' : 'Lease agreement',
        description: fr ? 'Contrat de location écrit.' : 'Written tenancy agreement.',
        is_mandatory: true,
      },
      ...(code === 'TN'
        ? [
            {
              doc_type: fr ? 'Attestation de RS' : 'RS withholding certificate',
              description: fr
                ? 'Document délivré par le locataire B2B après retenue de 15 % et versement au fisc.'
                : 'Issued by the B2B tenant after 15% withholding and remittance to the tax authority.',
              is_mandatory: true,
            },
          ]
        : []),
    ],
    mandatory_mentions: fr
      ? [
          'Cette quittance annule tous les reçus qui auraient pu être donnés pour acompte sur les présentes échéances.',
          'Elle est délivrée sous réserve de tous mes droits.',
          ...(code === 'TN'
            ? ['En cas de location B2B : retenue à la source de 15 % à la charge du locataire, avec attestation de RS.']
            : []),
        ]
      : [
          'This receipt confirms payment of rent for the period stated.',
          ...(code === 'TN'
            ? ['B2B rental: 15% withholding tax by the tenant, with RS certificate to the landlord.']
            : []),
        ],
    user_review_prompt_message: fr
      ? `Voici une proposition de profil légal pour ${code} (mode hors ligne, clé IA absente). Relisez taxes, documents et mentions, corrigez si besoin, puis validez. Rien n’est appliqué tant que vous ne confirmez pas.`
      : `Here is a proposed legal profile for ${code} (offline mode: no AI key). Review taxes, documents and mandatory mentions, edit if needed, then confirm. Nothing is applied until you validate.`,
  };
}

async function callLegalModel(
  countryCode: string,
  locale: 'en' | 'fr',
  question: string,
  currentRules: LegalRules,
): Promise<z.infer<typeof aiPayloadSchema>> {
  if (!env.OPENAI_API_KEY) {
    return offlineProposal(countryCode, locale);
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
        { role: 'system', content: LEGAL_SYSTEM_PROMPT },
        {
          role: 'user',
          content: JSON.stringify({
            country_code: countryCode,
            locale,
            question,
            current_catalog_rules: currentRules,
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

  const parsed = aiPayloadSchema.safeParse(JSON.parse(content));
  if (!parsed.success) {
    throw new HttpError(502, 'Invalid AI response: JSON does not match the legal profile schema');
  }
  return parsed.data;
}
