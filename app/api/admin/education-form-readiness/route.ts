import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/guards'
import { getEducationFormReadinessReport } from '@/lib/productivity/education-form-readiness'

export async function GET() {
  await requireAdmin()
  return NextResponse.json(getEducationFormReadinessReport())
}
