import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/session'
import { getFeedbackReadinessReport } from '@/lib/growth/feedback-readiness'

export async function GET() {
  await requireAdmin()
  return NextResponse.json(getFeedbackReadinessReport())
}
