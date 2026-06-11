import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/session'
import { getDeadlineAppealReadinessReport } from '@/lib/productivity/deadline-appeal-readiness'

export async function GET() {
  await requireAdmin()
  return NextResponse.json(getDeadlineAppealReadinessReport())
}
