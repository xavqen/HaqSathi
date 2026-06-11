import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/session'
import { getPwaReadinessReport } from '@/lib/pwa/readiness'

export async function GET() {
  await requireAdmin()
  return NextResponse.json(getPwaReadinessReport())
}
