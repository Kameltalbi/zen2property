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
  maxProperties: number | null;
  maxUsers: number | null;
  maxTenants: number | null;
  popular: boolean;
  custom: boolean;
};

export const PLANS: Record<PlanId, Plan> = {
  FREE: {
    id: 'FREE',
    code: 'free',
    name: 'Rentelyo Free',
    tagline: 'Manage your first rented property for free.',
    ...PLAN_LIMITS.free,
    popular: false,
    custom: false,
  },
  SMART: {
    id: 'SMART',
    code: 'smart',
    name: 'Rentelyo Smart',
    tagline: 'For landlords managing up to 5 properties.',
    ...PLAN_LIMITS.smart,
    popular: true,
    custom: false,
  },
  PREMIUM: {
    id: 'PREMIUM',
    code: 'premium',
    name: 'Rentelyo Premium',
    tagline: 'For landlords managing up to 15 properties.',
    ...PLAN_LIMITS.premium,
    popular: false,
    custom: false,
  },
  AGENCY: {
    id: 'AGENCY',
    code: 'agency',
    name: 'Rentelyo Agence',
    tagline: 'Custom limits for agencies and large portfolios.',
    ...PLAN_LIMITS.agency,
    popular: false,
    custom: true,
  },
};

export function planOf(id: string): Plan {
  const code = planCodeFromId(id);
  return PLANS[planIdFromCode(code)];
}

export function upgradeHint(plan: Plan): string {
  if (plan.id === 'FREE') return 'Upgrade to Rentelyo Smart to manage up to 5 properties.';
  if (plan.id === 'SMART') return 'Upgrade to Rentelyo Premium to manage up to 15 properties.';
  if (plan.id === 'PREMIUM') return 'Contact us for a custom Agence plan.';
  return 'Contact us for a custom Agence plan.';
}
