import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/session'
import { getEntitlementReadinessReport } from '@/lib/billing/entitlement-readiness'

export async function GET() {
  await requireAdmin()
  return NextResponse.json(getEntitlementReadinessReport())
}
