import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/guards'
import { getLoanAppReadinessReport } from '@/lib/productivity/loan-app-readiness'

export async function GET() {
  await requireAdmin()
  return NextResponse.json(getLoanAppReadinessReport())
}
