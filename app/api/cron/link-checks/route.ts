import { NextRequest, NextResponse } from 'next/server'
import { runOfficialLinkChecks, summarizeOfficialLinkChecks } from '@/lib/link-checks/checker'

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
    return NextResponse.json({ ok: false, error: 'Unauthorized cron request.' }, { status: 401 })
  }

  const limitParam = req.nextUrl.searchParams.get('limit')
  const limit = limitParam ? Number(limitParam) : undefined
  const results = await runOfficialLinkChecks(limit)
  const summary = summarizeOfficialLinkChecks(results)

  return NextResponse.json({
    ok: true,
    summary,
    results,
    checkedAt: new Date().toISOString(),
    nextStep: summary.broken > 0 || summary.needsReview > 0 ? 'Open /admin/link-checks and manually verify flagged official links.' : 'All checked links are reachable; keep manual content verification for deadline/date claims.'
  })
}
