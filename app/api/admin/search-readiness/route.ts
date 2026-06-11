import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/session'
import { getSearchReadinessReport } from '@/lib/search-readiness'

export async function GET() {
  await requireAdmin()
  return NextResponse.json(getSearchReadinessReport())
}
