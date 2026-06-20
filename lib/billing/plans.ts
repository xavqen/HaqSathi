export const PLAN_ORDER = ['FREE', 'PRO', 'FAMILY', 'AGENT'] as const
export type PlanKey = (typeof PLAN_ORDER)[number]

export const PLAN_RANK: Record<PlanKey, number> = {
  FREE: 0,
  PRO: 1,
  FAMILY: 2,
  AGENT: 3
}

export function normalizePlan(plan?: string | null): PlanKey {
  const value = String(plan || 'FREE').trim().toUpperCase()
  return PLAN_ORDER.includes(value as PlanKey) ? (value as PlanKey) : 'FREE'
}

export function comparePlans(left?: string | null, right?: string | null) {
  return PLAN_RANK[normalizePlan(left)] - PLAN_RANK[normalizePlan(right)]
}

export function isPaidPlan(plan?: string | null) {
  return normalizePlan(plan) !== 'FREE'
}

export function highestPlan(...plans: Array<string | null | undefined>): PlanKey {
  return plans.map(normalizePlan).sort((a, b) => PLAN_RANK[b] - PLAN_RANK[a])[0] || 'FREE'
}
