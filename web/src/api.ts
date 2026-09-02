const TOKEN_KEY = 'rentelyo.token';

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null): void {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (!headers.has('Content-Type') && init.body) headers.set('Content-Type', 'application/json');
  const token = getToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const res = await fetch(`/api/v1${path}`, { ...init, headers });
  if (res.status === 204) return undefined as T;

  const data = (await res.json().catch(() => ({}))) as { error?: string; details?: Record<string, unknown> };
  if (!res.ok) {
    const err = new ApiError(data.error || 'Request failed', res.status);
    (err as ApiError & { details?: Record<string, unknown> }).details = data.details;
    throw err;
  }
  return data as T;
}

export async function downloadPdf(path: string, filename: string): Promise<void> {
  const token = getToken();
  const res = await fetch(`/api/v1${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new ApiError('Unable to download PDF', res.status);
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export type User = {
  id: string;
  email: string;
  fullName: string;
  countryCode: string;
  locale: string;
  defaultCurrency: string;
  address: string | null;
  bankDetails: string | null;
  receiptSignature: string | null;
  plan: 'FREE' | 'SMART' | 'PREMIUM' | 'AGENCY' | 'PRO' | 'INVESTOR';
  subscriptionStatus?: 'none' | 'trialing' | 'active' | 'past_due' | 'canceled';
  isAdmin?: boolean;
  isActive?: boolean;
  billingCountryCode?: string;
  billingRegion?: string | null;
  pricingMarket?: string;
  preferredCurrency?: string;
};

export function homePath(user: Pick<User, 'isAdmin'>): string {
  return user.isAdmin ? '/superadmin' : '/app';
}

export type Property = {
  id: string;
  name: string;
  address: string;
  city: string | null;
  postalCode: string | null;
  countryCode: string;
  surface: number | null;
  type: string;
  monthlyRent: number | null;
  monthlyCharges: number;
  currency: string;
};

export type Tenant = {
  id: string;
  propertyId: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  moveInDate: string;
  moveOutDate: string | null;
  deposit: number;
};

export type Payment = {
  id: string;
  propertyId: string;
  tenantId: string | null;
  amount: number;
  rentAmount: number | null;
  chargesAmount: number | null;
  currency: string;
  periodStart: string;
  periodEnd: string;
  dueDate: string;
  paidDate: string | null;
  status: 'PAID' | 'PENDING' | 'LATE' | 'PARTIAL';
  method: string | null;
};

export type Lease = {
  id: string;
  propertyId: string;
  tenantId: string;
  label: string | null;
  status: 'draft' | 'active' | 'ended' | 'terminated';
  leaseType: 'furnished' | 'unfurnished' | 'commercial' | 'other';
  startDate: string;
  endDate: string | null;
  durationMonths: number | null;
  noticePeriodDays: number;
  monthlyRent: number;
  monthlyCharges: number;
  currency: string;
  deposit: number;
  paymentDay: number;
  paymentFrequency: 'monthly' | 'quarterly';
  rentIncreaseFrequency: 'yearly' | 'every_2_years' | 'every_3_years' | 'other' | 'none';
  rentIncreaseOtherMonths: number | null;
  rentIncreaseType: 'percent' | 'fixed' | 'index';
  rentIncreaseValue: number;
  rentIncreaseIndex: string | null;
  nextIncreaseDate: string | null;
  includesUtilities: boolean;
  petsAllowed: boolean;
  notes: string | null;
};

export type PlanCatalogPlan = {
  id: 'FREE' | 'SMART' | 'PREMIUM' | 'AGENCY';
  code: 'free' | 'smart' | 'premium' | 'agency';
  name: string;
  tagline: string;
  popular: boolean;
  custom: boolean;
  maxProperties: number | null;
  maxUsers: number | null;
  maxTenants: number | null;
  monthlyMinor: number;
  yearlyMinor: number;
  monthlyFormatted: string;
  yearlyFormatted: string;
};

export type PlanCatalog = {
  countryCode: string;
  market: string;
  displayCurrency: string;
  chargeCurrency: string;
  chargeDiffersFromDisplay: boolean;
  locale: string;
  plans: PlanCatalogPlan[];
  chargeDisclosure?: {
    displayCurrency: string;
    chargeCurrency: string;
    message: string;
  };
};
