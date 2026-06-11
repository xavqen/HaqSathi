import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/session'
import { getObservabilitySloReadinessReport } from '@/lib/operations/observability-slo-readiness'

export async function GET() {
  await requireAdmin()
  return NextResponse.json(getObservabilitySloReadinessReport())
}
