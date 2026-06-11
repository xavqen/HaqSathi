import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/session'
import { getVoiceInputReadinessReport } from '@/lib/voice/readiness'

export async function GET() {
  await requireAdmin()
  return NextResponse.json(getVoiceInputReadinessReport())
}
