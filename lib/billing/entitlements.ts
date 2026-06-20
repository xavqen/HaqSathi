import 'server-only'
import { db } from '@/lib/db'
import { highestPlan, normalizePlan, type PlanKey } from '@/lib/billing/plans'

type BillingSource = 'user' | 'active_subscription' | 'paid_order'

export type BillingEntitlement = {
  plan: PlanKey
  source: BillingSource
  activeSubscription: { id: string; plan: string; status: string; updatedAt: Date } | null
  latestPaidOrder: { id: string; plan: string; status: string; updatedAt: Date } | null
}

export function resolveEffectivePlan(input: {
  userPlan?: string | null
  activeSubscriptionPlan?: string | null
  latestPaidOrderPlan?: string | null
}): { plan: PlanKey; source: BillingSource } {
  const userPlan = normalizePlan(input.userPlan)
  const subscriptionPlan = normalizePlan(input.activeSubscriptionPlan)
  const paidOrderPlan = normalizePlan(input.latestPaidOrderPlan)
  const plan = highestPlan(userPlan, subscriptionPlan, paidOrderPlan)

  if (plan === subscriptionPlan && subscriptionPlan !== 'FREE') return { plan, source: 'active_subscription' }
  if (plan === paidOrderPlan && paidOrderPlan !== 'FREE') return { plan, source: 'paid_order' }
  return { plan, source: 'user' }
}

export async function getBillingEntitlement(userId: string, storedPlan?: string | null): Promise<BillingEntitlement> {
  const [activeSubscription, latestPaidOrder] = await Promise.all([
    db.subscription.findFirst({
      where: { userId, status: { in: ['ACTIVE', 'active', 'PAID', 'paid'] } },
      orderBy: { updatedAt: 'desc' },
      select: { id: true, plan: true, status: true, updatedAt: true }
    }).catch(() => null),
    db.paymentOrder.findFirst({
      where: { userId, status: 'PAID' },
      orderBy: { updatedAt: 'desc' },
      select: { id: true, plan: true, status: true, updatedAt: true }
    }).catch(() => null)
  ])

  const effective = resolveEffectivePlan({
    userPlan: storedPlan,
    activeSubscriptionPlan: activeSubscription?.plan,
    latestPaidOrderPlan: latestPaidOrder?.plan
  })

  return { ...effective, activeSubscription, latestPaidOrder }
}

export async function syncUserPlanFromBilling(userId: string, storedPlan?: string | null) {
  const entitlement = await getBillingEntitlement(userId, storedPlan)
  if (entitlement.plan !== normalizePlan(storedPlan)) {
    await db.user.update({ where: { id: userId }, data: { plan: entitlement.plan } }).catch(() => undefined)
  }
  return entitlement
}
