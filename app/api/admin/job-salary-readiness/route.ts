import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/guards'
import { getJobSalaryReadinessReport } from '@/lib/productivity/job-salary-readiness'

export async function GET() {
  await requireAdmin()
  return NextResponse.json(getJobSalaryReadinessReport())
}
