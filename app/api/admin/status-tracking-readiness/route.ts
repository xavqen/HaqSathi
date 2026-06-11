import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/session'
import { getStatusTrackingReadinessReport } from '@/lib/status-tracking-readiness'

export async function GET() {
  await requireAdmin()
  return NextResponse.json(getStatusTrackingReadinessReport())
}
