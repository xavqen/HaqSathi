import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/session'
import { getIncidentResponseReadinessReport } from '@/lib/operations/incident-response-readiness'

export async function GET() {
  await requireAdmin()
  return NextResponse.json(getIncidentResponseReadinessReport())
}
