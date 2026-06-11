import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/session'
import { getAbusePreventionReadinessReport } from '@/lib/abuse/prevention-readiness'

export async function GET() {
  await requireAdmin()
  return NextResponse.json(getAbusePreventionReadinessReport())
}
