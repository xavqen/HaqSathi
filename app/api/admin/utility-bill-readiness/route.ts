import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/guards'
import { getUtilityBillDisputeReadinessReport } from '@/lib/productivity/utility-bill-dispute-readiness'

export async function GET() {
  await requireAdmin()
  return NextResponse.json(getUtilityBillDisputeReadinessReport())
}
