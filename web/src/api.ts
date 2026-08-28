const TOKEN_KEY = 'zen2property.token';

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

  const data = (await res.json().catch(() => ({}))) as { error?: string };
  if (!res.ok) throw new ApiError(data.error || 'Request failed', res.status);
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
  plan: 'FREE' | 'INVESTOR' | 'PRO';
  subscriptionStatus?: 'none' | 'trialing' | 'active' | 'past_due' | 'canceled';
  isAdmin?: boolean;
  isActive?: boolean;
};

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

export type Plan = {
  id: 'FREE' | 'INVESTOR' | 'PRO';
  name: string;
  tagline: string;
  monthlyUsd: number;
  maxProperties: number | null;
  receipts: boolean;
  aiLegal: boolean;
  customRules: boolean;
};
