import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/session'
import { getTranslationReviewReadinessReport } from '@/lib/translation/review-readiness'

export async function GET() {
  await requireAdmin()
  return NextResponse.json(getTranslationReviewReadinessReport())
}
