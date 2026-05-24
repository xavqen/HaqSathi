import { db } from '@/lib/db'

type CurrentUser = { id: string; plan: 'FREE' | 'PRO' | 'FAMILY' | 'AGENT' }

const monthlyLimits: Record<CurrentUser['plan'], number | null> = {
  FREE: 3,
  PRO: null,
  FAMILY: null,
  AGENT: null
}

export function getMonthKey(date = new Date()) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`
}

export async function getMonthlyUsageSummary(userId: string) {
  const monthKey = getMonthKey()
  const rows = await db.aiUsageEvent.groupBy({
    by: ['tool'],
    where: { userId, monthKey },
    _count: { tool: true }
  }).catch(() => [])
  return rows.map((row) => ({ tool: row.tool, count: row._count.tool }))
}

export async function assertCanUseAi(user: CurrentUser | null, tool: string) {
  if (!user) return { ok: true as const, remaining: null }
  const limit = monthlyLimits[user.plan]
  if (limit === null) return { ok: true as const, remaining: null }

  const monthKey = getMonthKey()
  const used = await db.aiUsageEvent.count({ where: { userId: user.id, tool, monthKey } }).catch(() => 0)
  if (used >= limit) {
    return {
      ok: false as const,
      remaining: 0,
      message: `Free plan me ${limit} ${tool} drafts/month limit hai. Billing page se Pro upgrade karo ya next month wait karo.`
    }
  }
  return { ok: true as const, remaining: limit - used }
}

export async function recordAiUsage(user: CurrentUser | null, tool: string) {
  if (!user) return
  await db.aiUsageEvent.create({ data: { userId: user.id, tool, monthKey: getMonthKey() } }).catch(() => undefined)
}
