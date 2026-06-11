import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/session'
import { getDependencyReadinessReport } from '@/lib/security/dependency-readiness'

export async function GET() {
  await requireAdmin()
  return NextResponse.json(getDependencyReadinessReport())
}
