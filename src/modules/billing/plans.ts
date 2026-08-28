export type PlanId = 'FREE' | 'INVESTOR' | 'PRO';

export type Plan = {
  id: PlanId;
  name: string;
  tagline: string;
  monthlyUsd: number;
  maxProperties: number | null;
  receipts: boolean;
  aiLegal: boolean;
  customRules: boolean;
};

export const PLANS: Record<PlanId, Plan> = {
  FREE: {
    id: 'FREE',
    name: 'Starter',
    tagline: 'Two units, core tracking, PDF receipts.',
    monthlyUsd: 0,
    maxProperties: 2,
    receipts: true,
    aiLegal: false,
    customRules: false,
  },
  INVESTOR: {
    id: 'INVESTOR',
    name: 'Investor',
    tagline: 'A small portfolio with country-aware compliance.',
    monthlyUsd: 12,
    maxProperties: 8,
    receipts: true,
    aiLegal: true,
    customRules: false,
  },
  PRO: {
    id: 'PRO',
    name: 'Pro',
    tagline: 'Unlimited units, AI legal drafts, custom rules.',
    monthlyUsd: 29,
    maxProperties: null,
    receipts: true,
    aiLegal: true,
    customRules: true,
  },
};

export function planOf(id: string): Plan {
  return PLANS[(id as PlanId) in PLANS ? (id as PlanId) : 'FREE'];
}
