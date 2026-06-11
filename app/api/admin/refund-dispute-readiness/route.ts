import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/session'
import { getRefundDisputeReadinessReport } from '@/lib/billing/refund-dispute-readiness'

export async function GET() {
  await requireAdmin()
  return NextResponse.json(getRefundDisputeReadinessReport())
}
