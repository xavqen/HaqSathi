import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/session'
import { getCallVisitLogbookReadinessReport } from '@/lib/productivity/call-visit-logbook-readiness'

export async function GET() {
  await requireAdmin()
  return NextResponse.json(getCallVisitLogbookReadinessReport())
}
