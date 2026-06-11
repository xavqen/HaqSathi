import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/session'
import { getAuditTrailReadinessReport } from '@/lib/audit-trail/readiness'

export async function GET() {
  await requireAdmin()
  return NextResponse.json(getAuditTrailReadinessReport())
}
