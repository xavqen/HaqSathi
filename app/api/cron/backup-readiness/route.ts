import { NextRequest, NextResponse } from 'next/server'
import { collectBackupReadiness } from '@/lib/backups/readiness'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

function isAuthorized(req: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (!secret) return process.env.NODE_ENV !== 'production'
  const header = req.headers.get('authorization') || ''
  const querySecret = req.nextUrl.searchParams.get('secret') || ''
  return header === `Bearer ${secret}` || querySecret === secret
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized backup readiness request.' }, { status: 401 })
  }

  const report = await collectBackupReadiness()
  return NextResponse.json(report, {
    headers: {
      'Cache-Control': 'no-store',
      'X-HaqSathi-Backup-Readiness': report.ok ? 'ready' : 'action-needed'
    }
  })
}
