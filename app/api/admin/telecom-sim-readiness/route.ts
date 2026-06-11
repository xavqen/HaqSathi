import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/guards'
import { getTelecomSimReadinessReport } from '@/lib/productivity/telecom-sim-readiness'

export async function GET() {
  await requireAdmin()
  return NextResponse.json(getTelecomSimReadinessReport())
}
