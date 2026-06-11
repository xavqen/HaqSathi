import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/session'
import { getOnboardingAssistantReadinessReport } from '@/lib/onboarding/assistant-readiness'

export async function GET() {
  await requireAdmin()
  return NextResponse.json(getOnboardingAssistantReadinessReport())
}
