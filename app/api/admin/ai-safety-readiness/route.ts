import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/session'
import { getAiQualitySafetyReadinessReport } from '@/lib/ai-quality-safety-readiness'

export async function GET() {
  await requireAdmin()
  return NextResponse.json(getAiQualitySafetyReadinessReport())
}
