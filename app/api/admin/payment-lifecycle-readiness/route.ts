import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/session'
import { getPaymentLifecycleReadinessReport } from '@/lib/payment-lifecycle-readiness'

export async function GET() {
  await requireAdmin()
  return NextResponse.json(getPaymentLifecycleReadinessReport())
}
