import { useEffect, useState, type FormEvent } from 'react';
import { api } from '../api';
import { useAuth } from '../auth';
import { useI18n } from '../i18n';
import { countryLabel, useCountries } from '../lib/countries';
import { resetCoachTips } from '../onboarding/CoachChat';

type B2bWithholding = {
  enabled: boolean;
  rate_percent: number;
  withheld_by: 'tenant' | 'landlord';
  remitted_to_tax_authority: boolean;
  attestation_name: string;
  note: string;
};

type TaxRules = {
  vat_applicable: boolean;
  default_tax_rate: number;
  tax_id_label: string;
  b2b_withholding?: B2bWithholding;
};

type RequiredDocument = { doc_type: string; description: string; is_mandatory: boolean };

type LegalRules = {
  receipt: { title: string; requiredFields: string[]; splitRentAndCharges: boolean; legalNotice: string };
  tax?: TaxRules;
  requiredDocuments?: RequiredDocument[];
  mandatoryMentions?: string[];
  userReviewPromptMessage?: string;
};

type LegalProfile = {
  country_code: string;
  version: number;
  status?: string;
  rules: LegalRules;
};

type Draft = {
  id: string;
  status: string;
  reviewMessage: string | null;
  taxRules?: TaxRules;
  requiredDocuments: RequiredDocument[];
  mandatoryMentions: string[];
  proposedRules: LegalRules;
};

const emptyWithholding: B2bWithholding = {
  enabled: false,
  rate_percent: 0,
  withheld_by: 'tenant',
  remitted_to_tax_authority: true,
  attestation_name: '',
  note: '',
};

const emptyTax: TaxRules = {
  vat_applicable: false,
  default_tax_rate: 0,
  tax_id_label: 'Tax ID',
  b2b_withholding: { ...emptyWithholding },
};

function normalizeTax(tax?: TaxRules | null): TaxRules {
  return {
    vat_applicable: tax?.vat_applicable ?? false,
    default_tax_rate: tax?.default_tax_rate ?? 0,
    tax_id_label: tax?.tax_id_label || 'Tax ID',
    b2b_withholding: { ...emptyWithholding, ...tax?.b2b_withholding },
  };
}

function tnDefaults(locale: 'en' | 'fr'): { tax: TaxRules; documents: RequiredDocument[]; mentions: string[] } {
  const fr = locale === 'fr';
  return {
    tax: {
      vat_applicable: false,
      default_tax_rate: 0,
      tax_id_label: fr ? 'Matricule fiscal' : 'Tax ID',
      b2b_withholding: {
        enabled: true,
        rate_percent: 15,
        withheld_by: 'tenant',
        remitted_to_tax_authority: true,
        attestation_name: fr ? 'Attestation de RS' : 'RS certificate',
        note: fr
          ? 'En location B2B, le locataire retient 15 % du loyer, le verse au fisc et envoie une attestation de RS au propriétaire.'
          : 'For B2B rentals, the tenant withholds 15% of rent, remits it to the tax authority, and sends an RS certificate to the landlord.',
      },
    },
    documents: [
      {
        doc_type: fr ? 'Quittance de loyer' : 'Rent receipt',
        description: fr ? 'Justificatif du loyer payé.' : 'Proof of rent paid.',
        is_mandatory: true,
      },
      {
        doc_type: fr ? 'Bail' : 'Lease agreement',
        description: fr ? 'Contrat de location écrit.' : 'Written tenancy agreement.',
        is_mandatory: true,
      },
      {
        doc_type: fr ? 'Attestation de RS' : 'RS withholding certificate',
        description: fr
          ? 'Délivrée par le locataire B2B après retenue de 15 % et versement au fisc.'
          : 'Issued by the B2B tenant after 15% withholding and remittance to the tax authority.',
        is_mandatory: true,
      },
    ],
    mentions: [
      fr
        ? 'En cas de location B2B : retenue à la source de 15 % à la charge du locataire, avec attestation de RS.'
        : 'B2B rental: 15% withholding by the tenant, with RS certificate to the landlord.',
    ],
  };
}

export function SettingsPage() {
  const { user, refresh } = useAuth();
  const { t, locale } = useI18n();
  const countries = useCountries();
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [catalog, setCatalog] = useState<LegalProfile | null>(null);
  const [confirmed, setConfirmed] = useState<LegalProfile | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [tax, setTax] = useState<TaxRules>(emptyTax);
  const [documents, setDocuments] = useState<RequiredDocument[]>([]);
  const [mentions, setMentions] = useState<string[]>([]);
  const [form, setForm] = useState({
    fullName: user?.fullName ?? '',
    address: user?.address ?? '',
    bankDetails: user?.bankDetails ?? '',
    receiptSignature: user?.receiptSignature ?? '',
    countryCode: user?.countryCode ?? 'GB',
    defaultCurrency: user?.defaultCurrency ?? 'GBP',
  });

  useEffect(() => {
    if (user) {
      setForm({
        fullName: user.fullName,
        address: user.address ?? '',
        bankDetails: user.bankDetails ?? '',
        receiptSignature: user.receiptSignature ?? '',
        countryCode: user.countryCode,
        defaultCurrency: user.defaultCurrency,
      });
    }
  }, [user]);

  useEffect(() => {
    void loadLegal(form.countryCode);
  }, [form.countryCode]);

  function applyDraftToForm(next: Draft) {
    setDraft(next);
    setTax(normalizeTax(next.taxRules ?? next.proposedRules.tax));
    setDocuments(next.requiredDocuments.length ? next.requiredDocuments : next.proposedRules.requiredDocuments ?? []);
    setMentions(next.mandatoryMentions.length ? next.mandatoryMentions : next.proposedRules.mandatoryMentions ?? []);
  }

  async function loadLegal(countryCode: string) {
    try {
      const data = await api<{ catalog: LegalProfile; confirmed: LegalProfile | null; pendingDraft: Draft | null }>(
        `/legal/ai/mine/${countryCode}`,
      );
      setCatalog(data.catalog);
      setConfirmed(data.confirmed);
      if (data.pendingDraft) {
        applyDraftToForm(data.pendingDraft);
      } else if (data.confirmed?.rules) {
        setDraft(null);
        setTax(normalizeTax(data.confirmed.rules.tax));
        setDocuments(data.confirmed.rules.requiredDocuments ?? []);
        setMentions(data.confirmed.rules.mandatoryMentions ?? []);
      } else {
        setDraft(null);
        const catTax = normalizeTax(data.catalog.rules.tax);
        const catDocs = data.catalog.rules.requiredDocuments ?? [];
        const catMentions = data.catalog.rules.mandatoryMentions ?? [];
        if (countryCode === 'TN' && !catTax.b2b_withholding?.enabled) {
          const defaults = tnDefaults(locale);
          setTax(defaults.tax);
          setDocuments(catDocs.length ? catDocs : defaults.documents);
          setMentions(catMentions.length ? catMentions : defaults.mentions);
        } else {
          setTax(catTax);
          setDocuments(catDocs);
          setMentions(catMentions);
        }
      }
    } catch {
      setCatalog(null);
      setConfirmed(null);
      setDraft(null);
      if (countryCode === 'TN') {
        const defaults = tnDefaults(locale);
        setTax(defaults.tax);
        setDocuments(defaults.documents);
        setMentions(defaults.mentions);
      }
    }
  }

  async function save(e: FormEvent) {
    e.preventDefault();
    setError('');
    try {
      await api('/me', { method: 'PATCH', body: JSON.stringify(form) });
      await refresh();
      setNotice(locale === 'fr' ? 'Profil enregistré.' : 'Profile saved.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    }
  }

  async function generate() {
    setError('');
    setNotice('');
    setBusy(true);
    try {
      const data = await api<{ draft: Draft }>('/legal/ai/propose', {
        method: 'POST',
        body: JSON.stringify({
          countryCode: form.countryCode,
          locale,
          question: `Generate the full legal, tax and document profile for landlords in ${form.countryCode}.`,
        }),
      });
      applyDraftToForm(data.draft);
      setNotice(t.legalReview.pending);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'AI request failed');
    } finally {
      setBusy(false);
    }
  }

  async function saveManual() {
    setError('');
    setBusy(true);
    try {
      const payload = {
        countryCode: form.countryCode,
        locale,
        tax_rules: {
          ...tax,
          b2b_withholding: tax.b2b_withholding?.enabled
            ? tax.b2b_withholding
            : { ...emptyWithholding, enabled: false },
        },
        required_documents: documents.filter((d) => d.doc_type.trim()),
        mandatory_mentions: mentions.filter((m) => m.trim()),
        user_review_prompt_message:
          draft?.reviewMessage ||
          (locale === 'fr'
            ? `Profil légal défini manuellement pour ${form.countryCode}.`
            : `Legal profile set manually for ${form.countryCode}.`),
      };

      if (draft) {
        const data = await api<{ profile: LegalProfile }>('/legal/ai/drafts/' + draft.id + '/confirm', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        setConfirmed(data.profile);
        setDraft(null);
      } else {
        const data = await api<{ profile: LegalProfile }>('/legal/ai/manual', {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
        setConfirmed(data.profile);
      }
      setNotice(t.legalReview.savedManual);
      await loadLegal(form.countryCode);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setBusy(false);
    }
  }

  const wh = tax.b2b_withholding ?? emptyWithholding;
  const reviewMessage =
    draft?.reviewMessage ||
    confirmed?.rules.userReviewPromptMessage ||
    catalog?.rules.userReviewPromptMessage;

  return (
    <>
      <div className="page-head">
        <div>
          <p className="kicker">Account</p>
          <h1>Settings & legal</h1>
        </div>
      </div>
      {error && <p className="error">{error}</p>}
      {notice && <p className="ok">{notice}</p>}

      <form className="card form" onSubmit={(e) => void save(e)}>
        <h3>Landlord profile</h3>
        <label>
          Name
          <input value={form.fullName} onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))} />
        </label>
        <label>
          Address (printed on receipts)
          <textarea value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} />
        </label>
        <label>
          Bank details
          <textarea value={form.bankDetails} onChange={(e) => setForm((f) => ({ ...f, bankDetails: e.target.value }))} />
        </label>
        <label>
          Signature line
          <input
            value={form.receiptSignature}
            onChange={(e) => setForm((f) => ({ ...f, receiptSignature: e.target.value }))}
          />
        </label>
        <div className="grid-2">
          <label>
            Country
            <select value={form.countryCode} onChange={(e) => setForm((f) => ({ ...f, countryCode: e.target.value }))}>
              {countries.map((c) => (
                <option key={c.code} value={c.code}>
                  {countryLabel(c.code, locale)}
                </option>
              ))}
            </select>
          </label>
          <label>
            Default currency
            <input
              value={form.defaultCurrency}
              maxLength={3}
              onChange={(e) => setForm((f) => ({ ...f, defaultCurrency: e.target.value }))}
            />
          </label>
        </div>
        <p className="muted">Plan: {user?.plan}. Change it on the pricing page.</p>
        <button className="btn" type="submit">
          Save
        </button>
      </form>

      <div className="card form" style={{ marginTop: 16 }}>
        <h3>{t.legalReview.title}</h3>
        <p className="muted">{t.legalReview.ledeManual}</p>
        {confirmed?.status === 'validated' && <p className="ok">{t.legalReview.confirmed}</p>}
        {draft && <p className="ok">{t.legalReview.pending}</p>}
        {reviewMessage && <p className="muted">{reviewMessage}</p>}

        <h3>{t.legalReview.taxes}</h3>
        <label className="check-row">
          <input
            type="checkbox"
            checked={tax.vat_applicable}
            onChange={(e) => setTax((v) => ({ ...v, vat_applicable: e.target.checked }))}
          />
          {t.legalReview.vat}
        </label>
        <div className="grid-2">
          <label>
            {t.legalReview.rate}
            <input
              type="number"
              min="0"
              step="0.1"
              value={tax.default_tax_rate}
              onChange={(e) => setTax((v) => ({ ...v, default_tax_rate: Number(e.target.value) }))}
            />
          </label>
          <label>
            {t.legalReview.taxId}
            <input
              value={tax.tax_id_label}
              onChange={(e) => setTax((v) => ({ ...v, tax_id_label: e.target.value }))}
            />
          </label>
        </div>

        <h3>{t.legalReview.b2bTitle}</h3>
        <p className="muted">{t.legalReview.b2bLede}</p>
        <label className="check-row">
          <input
            type="checkbox"
            checked={wh.enabled}
            onChange={(e) =>
              setTax((v) => ({
                ...v,
                b2b_withholding: { ...(v.b2b_withholding ?? emptyWithholding), enabled: e.target.checked },
              }))
            }
          />
          {t.legalReview.b2bEnabled}
        </label>
        {wh.enabled && (
          <>
            <div className="grid-2">
              <label>
                {t.legalReview.b2bRate}
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={wh.rate_percent}
                  onChange={(e) =>
                    setTax((v) => ({
                      ...v,
                      b2b_withholding: {
                        ...(v.b2b_withholding ?? emptyWithholding),
                        rate_percent: Number(e.target.value),
                      },
                    }))
                  }
                />
              </label>
              <label>
                {t.legalReview.b2bBy}
                <select
                  value={wh.withheld_by}
                  onChange={(e) =>
                    setTax((v) => ({
                      ...v,
                      b2b_withholding: {
                        ...(v.b2b_withholding ?? emptyWithholding),
                        withheld_by: e.target.value as 'tenant' | 'landlord',
                      },
                    }))
                  }
                >
                  <option value="tenant">{t.legalReview.tenant}</option>
                  <option value="landlord">{t.legalReview.landlord}</option>
                </select>
              </label>
            </div>
            <label className="check-row">
              <input
                type="checkbox"
                checked={wh.remitted_to_tax_authority}
                onChange={(e) =>
                  setTax((v) => ({
                    ...v,
                    b2b_withholding: {
                      ...(v.b2b_withholding ?? emptyWithholding),
                      remitted_to_tax_authority: e.target.checked,
                    },
                  }))
                }
              />
              {t.legalReview.b2bRemit}
            </label>
            <label>
              {t.legalReview.b2bAttestation}
              <input
                value={wh.attestation_name}
                onChange={(e) =>
                  setTax((v) => ({
                    ...v,
                    b2b_withholding: {
                      ...(v.b2b_withholding ?? emptyWithholding),
                      attestation_name: e.target.value,
                    },
                  }))
                }
              />
            </label>
            <label>
              {t.legalReview.b2bNote}
              <textarea
                value={wh.note}
                onChange={(e) =>
                  setTax((v) => ({
                    ...v,
                    b2b_withholding: { ...(v.b2b_withholding ?? emptyWithholding), note: e.target.value },
                  }))
                }
              />
            </label>
          </>
        )}

        <h3>{t.legalReview.documents}</h3>
        <p className="muted">{t.legalReview.documentsLede}</p>
        {documents.map((doc, i) => (
          <div key={i} className="legal-doc-row">
            <label>
              {t.legalReview.docType}
              <input
                value={doc.doc_type}
                onChange={(e) =>
                  setDocuments((list) => list.map((d, idx) => (idx === i ? { ...d, doc_type: e.target.value } : d)))
                }
              />
            </label>
            <label>
              {t.legalReview.docDesc}
              <input
                value={doc.description}
                onChange={(e) =>
                  setDocuments((list) =>
                    list.map((d, idx) => (idx === i ? { ...d, description: e.target.value } : d)),
                  )
                }
              />
            </label>
            <label className="check-row">
              <input
                type="checkbox"
                checked={doc.is_mandatory}
                onChange={(e) =>
                  setDocuments((list) =>
                    list.map((d, idx) => (idx === i ? { ...d, is_mandatory: e.target.checked } : d)),
                  )
                }
              />
              {t.legalReview.docMandatory}
            </label>
            <button
              type="button"
              className="btn ghost"
              onClick={() => setDocuments((list) => list.filter((_, idx) => idx !== i))}
            >
              {t.legalReview.remove}
            </button>
          </div>
        ))}
        <button
          type="button"
          className="btn secondary"
          onClick={() => setDocuments((list) => [...list, { doc_type: '', description: '', is_mandatory: false }])}
        >
          {t.legalReview.addDocument}
        </button>

        <h3>{t.legalReview.mentions}</h3>
        {mentions.map((mention, i) => (
          <div key={i} className="legal-mention-row">
            <input
              value={mention}
              placeholder={t.legalReview.mentionPlaceholder}
              onChange={(e) => setMentions((list) => list.map((m, idx) => (idx === i ? e.target.value : m)))}
            />
            <button type="button" className="btn ghost" onClick={() => setMentions((list) => list.filter((_, idx) => idx !== i))}>
              {t.legalReview.remove}
            </button>
          </div>
        ))}
        <button type="button" className="btn ghost" onClick={() => setMentions((list) => [...list, ''])}>
          {t.legalReview.addMention}
        </button>

        <div className="legal-actions">
          <button className="btn" type="button" disabled={busy} onClick={() => void saveManual()}>
            {busy ? t.legalReview.saving : t.legalReview.saveManual}
          </button>
          <button className="btn secondary" type="button" disabled={busy} onClick={() => void generate()}>
            {busy ? t.legalReview.generating : t.legalReview.generateOptional}
          </button>
        </div>
      </div>

      <div className="ws-grid two" style={{ marginTop: 16 }}>
        <div className="ws-card">
          <h3>{locale === 'fr' ? 'Préférences' : 'Preferences'}</h3>
          <p className="muted">
            {locale === 'fr'
              ? 'Langue, devise et format de date suivent le compte et le basculeur FR/EN.'
              : 'Language, currency and date format follow the account and the FR/EN toggle.'}
          </p>
          <button
            type="button"
            className="btn secondary"
            style={{ marginTop: 10 }}
            onClick={() => resetCoachTips(user?.id)}
          >
            {t.coach.restart}
          </button>
        </div>
        <div className="ws-card">
          <h3>Notifications</h3>
          <p className="muted">
            {locale === 'fr'
              ? 'Rappels d’expiration documents, loyers et maintenance (à brancher).'
              : 'Document expiry, rent and maintenance reminders (to be wired).'}
          </p>
        </div>
        <div className="ws-card">
          <h3>{locale === 'fr' ? 'Sécurité' : 'Security'}</h3>
          <p className="muted">
            {locale === 'fr'
              ? 'Mot de passe et sessions JWT existants. Pas de changement d’auth.'
              : 'Existing password and JWT sessions. Auth is unchanged.'}
          </p>
        </div>
        <div className="ws-card">
          <h3>{locale === 'fr' ? 'Membres' : 'Members'}</h3>
          <p className="muted">
            {locale === 'fr'
              ? 'Permissions multi-utilisateurs : schéma à valider avant migration.'
              : 'Multi-user permissions: schema to approve before any migration.'}
          </p>
        </div>
        <div className="ws-card">
          <h3>{locale === 'fr' ? 'Abonnement' : 'Billing'}</h3>
          <p className="muted">
            {locale === 'fr' ? 'Plan actuel' : 'Current plan'}: {user?.plan}
          </p>
        </div>
        <div className="ws-card">
          <h3>{locale === 'fr' ? 'Import / export' : 'Import / export'}</h3>
          <p className="muted">
            {locale === 'fr'
              ? 'CSV, Excel, PDF — interface prête, fichiers réels après schéma.'
              : 'CSV, Excel, PDF — UI ready, real files after schema.'}
          </p>
        </div>
      </div>
    </>
  );
}
