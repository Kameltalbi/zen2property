export type PaidPlanCode = 'smart' | 'premium';
export type BillingPeriod = 'monthly' | 'yearly';

export function safeNextPath(raw: string | null | undefined): string | null {
  if (!raw) return null;
  if (!raw.startsWith('/') || raw.startsWith('//') || raw.includes('\\')) return null;
  return raw;
}

export function parsePaidPlan(raw: string | null): PaidPlanCode | null {
  if (raw === 'smart' || raw === 'premium') return raw;
  if (raw === 'SMART') return 'smart';
  if (raw === 'PREMIUM') return 'premium';
  return null;
}

export function parsePeriod(raw: string | null): BillingPeriod {
  return raw === 'yearly' ? 'yearly' : 'monthly';
}

export function checkoutPath(plan: PaidPlanCode, period: BillingPeriod): string {
  return `/checkout?plan=${plan}&period=${period}`;
}

export function authNextQuery(next: string): string {
  return `next=${encodeURIComponent(next)}`;
}
