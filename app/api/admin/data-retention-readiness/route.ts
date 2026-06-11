import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/session'
import { getDataRetentionReadinessReport } from '@/lib/data-retention/readiness'

export async function GET() {
  await requireAdmin()
  return NextResponse.json(getDataRetentionReadinessReport())
}
