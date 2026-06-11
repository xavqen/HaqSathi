import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/session'
import { getPaymentReconciliationReadinessReport } from '@/lib/billing/payment-reconciliation-readiness'

export async function GET() {
  await requireAdmin()
  return NextResponse.json(getPaymentReconciliationReadinessReport())
}
