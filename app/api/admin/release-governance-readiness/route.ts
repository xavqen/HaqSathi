import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/session'
import { getReleaseGovernanceReadinessReport } from '@/lib/operations/release-governance-readiness'

export async function GET() {
  await requireAdmin()
  return NextResponse.json(getReleaseGovernanceReadinessReport())
}
