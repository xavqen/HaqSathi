import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/session'
import { getInvoiceTaxReadinessReport } from '@/lib/billing/invoice-tax-readiness'

export async function GET() {
  await requireAdmin()
  return NextResponse.json(getInvoiceTaxReadinessReport())
}
