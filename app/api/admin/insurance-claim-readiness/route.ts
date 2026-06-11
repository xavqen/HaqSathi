import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/guards'
import { getInsuranceClaimReadinessReport } from '@/lib/productivity/insurance-claim-readiness'

export async function GET() {
  await requireAdmin()
  return NextResponse.json(getInsuranceClaimReadinessReport())
}
