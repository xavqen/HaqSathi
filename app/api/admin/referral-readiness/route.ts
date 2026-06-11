import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { getReferralGrowthReport } from '@/lib/referrals'

export async function GET() {
  await requireAdmin()
  const report = getReferralGrowthReport()
  const [totalInvites, convertedInvites, pendingInvites, recentInvites] = await Promise.all([
    db.referralInvite.count().catch(() => 0),
    db.referralInvite.count({ where: { status: 'CONVERTED' } }).catch(() => 0),
    db.referralInvite.count({ where: { status: { not: 'CONVERTED' } } }).catch(() => 0),
    db.referralInvite.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: { id: true, code: true, email: true, status: true, reward: true, createdAt: true }
    }).catch(() => [])
  ])

  return NextResponse.json({
    ...report,
    metrics: {
      totalInvites,
      convertedInvites,
      pendingInvites,
      conversionRate: totalInvites ? Number(((convertedInvites / totalInvites) * 100).toFixed(2)) : 0,
      recentInvites
    }
  })
}
