import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/session'
import { getLegalComplianceReadinessReport } from '@/lib/legal/compliance-readiness'

export async function GET() {
  await requireAdmin()
  return NextResponse.json(getLegalComplianceReadinessReport())
}
