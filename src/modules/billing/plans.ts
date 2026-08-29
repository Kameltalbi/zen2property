import {
  PLAN_LIMITS,
  planCodeFromId,
  planIdFromCode,
  type PlanCode,
  type PlanId,
} from './pricingMarkets';

export type { PlanId, PlanCode };
export { planCodeFromId, planIdFromCode, PLAN_LIMITS };

export type Plan = {
  id: PlanId;
  code: PlanCode;
  name: string;
  tagline: string;
  maxProperties: number;
  maxUsers: number;
  maxTenants: number | null;
  popular: boolean;
};

export const PLANS: Record<PlanId, Plan> = {
  FREE: {
    id: 'FREE',
    code: 'free',
    name: 'Zen Free',
    tagline: 'Manage your first rented property for free.',
    ...PLAN_LIMITS.free,
    popular: false,
  },
  PREMIUM: {
    id: 'PREMIUM',
    code: 'premium',
    name: 'Zen Premium',
    tagline: 'For landlords managing up to 10 properties.',
    ...PLAN_LIMITS.premium,
    popular: true,
  },
  PRO: {
    id: 'PRO',
    code: 'pro',
    name: 'Zen Pro',
    tagline: 'For investors and larger rental portfolios.',
    ...PLAN_LIMITS.pro,
    popular: false,
  },
};

export function planOf(id: string): Plan {
  const code = planCodeFromId(id);
  return PLANS[planIdFromCode(code)];
}

export function upgradeHint(plan: Plan): string {
  if (plan.id === 'FREE') return 'Upgrade to Zen Premium to manage up to 10 properties.';
  if (plan.id === 'PREMIUM') return 'Upgrade to Zen Pro to manage up to 50 properties.';
  return 'Contact us to manage more than 50 properties.';
}
