import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/session'
import { getDeploymentQaReadinessReport } from '@/lib/deployment/qa-readiness'

export async function GET() {
  await requireAdmin()
  return NextResponse.json(getDeploymentQaReadinessReport())
}
