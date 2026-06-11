import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/session'
import { getFeatureFlagsReadinessReport } from '@/lib/operations/feature-flags-readiness'

export async function GET() {
  await requireAdmin()
  return NextResponse.json(getFeatureFlagsReadinessReport())
}
