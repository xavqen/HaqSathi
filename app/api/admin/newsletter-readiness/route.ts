import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { getNewsletterCampaignReport } from '@/lib/newsletter/readiness'

export async function GET() {
  await requireAdmin()
  const report = getNewsletterCampaignReport()
  const [newsletterLogs, queued, sent, failed] = await Promise.all([
    db.emailLog.findMany({
      where: { template: { contains: 'newsletter' } },
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: { id: true, toEmail: true, subject: true, template: true, status: true, provider: true, createdAt: true }
    }).catch(() => []),
    db.emailLog.count({ where: { template: { contains: 'newsletter' }, status: 'QUEUED' } }).catch(() => 0),
    db.emailLog.count({ where: { template: { contains: 'newsletter' }, status: 'SENT' } }).catch(() => 0),
    db.emailLog.count({ where: { template: { contains: 'newsletter' }, status: 'FAILED' } }).catch(() => 0)
  ])

  return NextResponse.json({
    ...report,
    metrics: { queued, sent, failed, recentLogs: newsletterLogs }
  })
}
