import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/guards'
import { getMedicalBillReadinessReport } from '@/lib/productivity/medical-bill-readiness'

export async function GET() {
  await requireAdmin()
  return NextResponse.json(getMedicalBillReadinessReport())
}
