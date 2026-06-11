import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/session'
import { getSupportTriageReport } from '@/lib/support/triage-readiness'

export async function GET() {
  await requireAdmin()
  return NextResponse.json(getSupportTriageReport())
}
