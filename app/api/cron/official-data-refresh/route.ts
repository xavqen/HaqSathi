import { NextRequest, NextResponse } from 'next/server'
import { getOfficialDataRefreshReadinessReport } from '@/lib/official-data-refresh-readiness'

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

  const report = getOfficialDataRefreshReadinessReport()
  const dryRun = process.env.OFFICIAL_DATA_SYNC_DRY_RUN !== 'false'

  return NextResponse.json({
    ok: true,
    dryRun,
    checkedAt: new Date().toISOString(),
    summary: report.summary,
    datasets: report.datasets.map((dataset) => ({
      id: dataset.id,
      label: dataset.label,
      sourceCount: dataset.sourceCount,
      freshnessSlaDays: dataset.freshnessSlaDays,
      refreshMode: dataset.refreshMode,
      publicRisk: dataset.publicRisk
    })),
    nextStep: dryRun
      ? 'Dry-run complete. Open /admin/official-data-refresh and attach manual evidence before publishing official data updates.'
      : 'Sync mode is not dry-run. Review blocked/manual controls before enabling public official data updates.'
  })
}
