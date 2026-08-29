INSERT INTO countries (code, name, default_locale, default_currency)
VALUES ('TN', 'Tunisia', 'fr-TN', 'TND')
ON CONFLICT (code) DO NOTHING;

INSERT INTO legal_profiles (country_code, version, effective_from, receipt_template_key, rules, status)
SELECT
  'TN',
  1,
  CURRENT_DATE,
  'default',
  '{
    "receipt": {
      "mandatoryOnRequest": true,
      "title": "Quittance de loyer",
      "requiredFields": [
        "landlordName",
        "landlordAddress",
        "tenantName",
        "propertyAddress",
        "periodStart",
        "periodEnd",
        "rentAmount",
        "chargesAmount",
        "totalAmount",
        "paymentDate"
      ],
      "splitRentAndCharges": true,
      "legalNotice": "Cette quittance est délivrée sous réserve de tous mes droits. En location B2B, la retenue à la source de 15 % incombe au locataire.",
      "numbering": { "prefix": "Q", "reset": "yearly" }
    },
    "tax": {
      "vat_applicable": false,
      "default_tax_rate": 0,
      "tax_id_label": "Matricule fiscal",
      "b2b_withholding": {
        "enabled": true,
        "rate_percent": 15,
        "withheld_by": "tenant",
        "remitted_to_tax_authority": true,
        "attestation_name": "Attestation de RS",
        "note": "En location B2B, le locataire retient 15 % du loyer, le verse au fisc et envoie une attestation de RS au propriétaire."
      }
    },
    "requiredDocuments": [
      {
        "doc_type": "Quittance de loyer",
        "description": "Justificatif du loyer payé pour la période indiquée.",
        "is_mandatory": true
      },
      {
        "doc_type": "Bail",
        "description": "Contrat de location écrit.",
        "is_mandatory": true
      },
      {
        "doc_type": "État des lieux",
        "description": "Constat d’entrée et de sortie du logement.",
        "is_mandatory": false
      },
      {
        "doc_type": "Attestation de RS",
        "description": "Document délivré par le locataire B2B après retenue de 15 % et versement au fisc.",
        "is_mandatory": true
      }
    ],
    "mandatoryMentions": [
      "Cette quittance est délivrée sous réserve de tous mes droits.",
      "En cas de location B2B : retenue à la source de 15 % à la charge du locataire, avec attestation de RS."
    ]
  }'::jsonb,
  'catalog'
WHERE NOT EXISTS (
  SELECT 1 FROM legal_profiles WHERE country_code = 'TN' AND user_id IS NULL
);
