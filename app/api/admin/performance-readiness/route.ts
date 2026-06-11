import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/session'
import { getPerformanceReadinessReport } from '@/lib/performance/readiness'

export async function GET() {
  await requireAdmin()
  return NextResponse.json(getPerformanceReadinessReport())
}
