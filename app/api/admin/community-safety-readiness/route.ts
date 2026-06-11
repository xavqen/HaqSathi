import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/session'
import { getCommunitySafetyReadinessReport } from '@/lib/safety/community-safety-readiness'

export async function GET() {
  await requireAdmin()
  return NextResponse.json(getCommunitySafetyReadinessReport())
}
