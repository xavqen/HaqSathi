import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/session'
import { getSeoIndexingReadinessReport } from '@/lib/seo/indexing-readiness'

export async function GET() {
  await requireAdmin()
  return NextResponse.json(getSeoIndexingReadinessReport())
}
