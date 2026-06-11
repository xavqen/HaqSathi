import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/session'
import { getDatabaseIntegrityReadinessReport } from '@/lib/database/integrity-readiness'

export async function GET() {
  await requireAdmin()
  return NextResponse.json(getDatabaseIntegrityReadinessReport())
}
