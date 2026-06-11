import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/session'
import { getMobileAppReadinessReport } from '@/lib/mobile-app/readiness'

export async function GET() {
  await requireAdmin()
  return NextResponse.json(getMobileAppReadinessReport())
}
