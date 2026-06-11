import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/session'
import { getAccessibilityReadinessReport } from '@/lib/accessibility/readiness'

export async function GET() {
  await requireAdmin()
  return NextResponse.json(getAccessibilityReadinessReport())
}
