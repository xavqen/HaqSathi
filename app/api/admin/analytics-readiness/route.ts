import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/session'
import { getAnalyticsReadinessReport } from '@/lib/analytics/growth-readiness'

export async function GET() {
  await requireAdmin()
  return NextResponse.json(getAnalyticsReadinessReport())
}
