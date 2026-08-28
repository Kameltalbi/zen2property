export type Country = {
  code: string;
  name: string;
  default_locale: string;
  default_currency: string;
  is_active: boolean;
};

export type ReceiptRules = {
  mandatoryOnRequest: boolean;
  title: string;
  requiredFields: string[];
  splitRentAndCharges: boolean;
  legalNotice: string;
  numbering: { prefix: string; reset: 'yearly' | 'never' };
};

export type LegalRules = {
  receipt: ReceiptRules;
  deposit?: Record<string, unknown>;
  lease?: Record<string, unknown>;
  indexation?: Record<string, unknown>;
};

export type LegalProfile = {
  id: string;
  country_code: string;
  version: number;
  effective_from: string;
  rules: LegalRules;
  receipt_template_key: string;
  created_at: string;
};

export type UserRow = {
  id: string;
  email: string;
  password_hash: string;
  full_name: string;
  country_code: string;
  locale: string;
  default_currency: string;
  address: string | null;
  bank_details: string | null;
  receipt_signature: string | null;
  plan: 'FREE' | 'INVESTOR' | 'PRO';
  stripe_customer_id: string | null;
  is_admin: boolean;
  is_active: boolean;
  subscription_status: 'none' | 'trialing' | 'active' | 'past_due' | 'canceled';
  created_at: string;
  updated_at: string;
};

export type PropertyRow = {
  id: string;
  user_id: string;
  name: string;
  address: string;
  city: string | null;
  postal_code: string | null;
  country_code: string;
  surface: string | null;
  type: string;
  monthly_rent: string | null;
  monthly_charges: string;
  currency: string;
  created_at: string;
  updated_at: string;
};

export type TenantRow = {
  id: string;
  user_id: string;
  property_id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  move_in_date: string;
  move_out_date: string | null;
  deposit: string;
  created_at: string;
  updated_at: string;
};

export type PaymentRow = {
  id: string;
  user_id: string;
  property_id: string;
  tenant_id: string | null;
  amount: string;
  rent_amount: string | null;
  charges_amount: string | null;
  currency: string;
  period_start: string;
  period_end: string;
  due_date: string;
  paid_date: string | null;
  status: 'PAID' | 'PENDING' | 'LATE' | 'PARTIAL';
  method: string | null;
  description: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type ReceiptRow = {
  id: string;
  user_id: string;
  payment_id: string;
  number: string;
  legal_profile_id: string;
  legal_snapshot: LegalRules;
  pdf_path: string;
  issued_at: string;
};
