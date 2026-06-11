import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/session'
import { getOfficialDataRefreshReadinessReport } from '@/lib/official-data-refresh-readiness'

export async function GET() {
  await requireAdmin()
  return NextResponse.json(getOfficialDataRefreshReadinessReport())
}
