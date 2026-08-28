INSERT INTO countries (code, name, default_locale, default_currency) VALUES
  ('FR', 'France', 'fr-FR', 'EUR'),
  ('GB', 'United Kingdom', 'en-GB', 'GBP'),
  ('ES', 'España', 'es-ES', 'EUR'),
  ('DE', 'Deutschland', 'de-DE', 'EUR'),
  ('PT', 'Portugal', 'pt-PT', 'EUR'),
  ('IN', 'India', 'en-IN', 'INR')
ON CONFLICT (code) DO NOTHING;

-- France : quittance à la demande, loyer et charges dissociés (loi 89-462).
INSERT INTO legal_profiles (country_code, version, effective_from, receipt_template_key, rules)
VALUES (
  'FR',
  1,
  '2024-01-01',
  'fr_quittance',
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
      "legalNotice": "Cette quittance annule tous les reçus qui auraient pu être donnés pour acompte sur les présentes échéances. Elle est délivrée sous réserve de tous mes droits.",
      "numbering": { "prefix": "Q", "reset": "yearly" }
    },
    "deposit": {
      "unfurnishedMaxMonths": 1,
      "furnishedMaxMonths": 2
    },
    "lease": {
      "unfurnishedMinYears": 3,
      "furnishedMinYears": 1
    },
    "indexation": {
      "index": "IRL",
      "frequency": "annual"
    }
  }'::jsonb
)
ON CONFLICT (country_code, version) DO NOTHING;

INSERT INTO legal_profiles (country_code, version, effective_from, receipt_template_key, rules)
VALUES (
  'GB',
  1,
  '2024-01-01',
  'default',
  '{
    "receipt": {
      "mandatoryOnRequest": false,
      "title": "Rent receipt",
      "requiredFields": [
        "landlordName",
        "tenantName",
        "propertyAddress",
        "periodStart",
        "periodEnd",
        "totalAmount",
        "paymentDate"
      ],
      "splitRentAndCharges": false,
      "legalNotice": "This receipt confirms payment of rent for the period stated.",
      "numbering": { "prefix": "R", "reset": "yearly" }
    },
    "deposit": {
      "mustUseApprovedScheme": true,
      "maxDaysToProtect": 30
    }
  }'::jsonb
)
ON CONFLICT (country_code, version) DO NOTHING;

INSERT INTO legal_profiles (country_code, version, effective_from, receipt_template_key, rules)
VALUES (
  'ES',
  1,
  '2024-01-01',
  'default',
  '{
    "receipt": {
      "mandatoryOnRequest": true,
      "title": "Recibo de renta",
      "requiredFields": [
        "landlordName",
        "tenantName",
        "propertyAddress",
        "periodStart",
        "periodEnd",
        "totalAmount",
        "paymentDate"
      ],
      "splitRentAndCharges": false,
      "legalNotice": "El presente recibo acredita el pago de la renta correspondiente al periodo indicado.",
      "numbering": { "prefix": "R", "reset": "yearly" }
    },
    "deposit": {
      "unfurnishedMaxMonths": 1
    }
  }'::jsonb
)
ON CONFLICT (country_code, version) DO NOTHING;
