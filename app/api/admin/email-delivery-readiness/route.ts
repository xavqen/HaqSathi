import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { getEmailDeliveryReadinessReport } from '@/lib/email/delivery-readiness'

export async function GET() {
  await requireAdmin()
  const report = getEmailDeliveryReadinessReport()
  const [recentLogs, statusCounts] = await Promise.all([
    db.emailLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 12,
      select: { id: true, toEmail: true, subject: true, template: true, status: true, error: true, createdAt: true }
    }).catch(() => []),
    db.emailLog.groupBy({ by: ['status'], _count: { status: true } }).catch(() => [])
  ])

  return NextResponse.json({
    ...report,
    emailLogMetrics: {
      recentLogs: recentLogs.map((log) => ({ ...log, toEmail: maskEmail(log.toEmail) })),
      statusCounts
    }
  })
}

function maskEmail(email: string) {
  const [name = '', domain = ''] = email.split('@')
  if (!domain) return 'hidden'
  return `${name.slice(0, 2)}${'*'.repeat(Math.max(3, name.length - 2))}@${domain}`
}
