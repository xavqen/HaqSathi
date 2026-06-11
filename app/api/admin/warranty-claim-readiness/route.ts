import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/session'
import { getWarrantyClaimReadinessReport } from '@/lib/productivity/warranty-claim-readiness'

export async function GET() {
  await requireAdmin()
  return NextResponse.json(getWarrantyClaimReadinessReport())
}
