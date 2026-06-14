import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/guards'
import { getTravelRefundReadinessReport } from '@/lib/productivity/travel-refund-readiness'

export async function GET() {
  await requireAdmin()
  return NextResponse.json(getTravelRefundReadinessReport())
}
