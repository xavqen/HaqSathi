import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/guards'
import { getVehicleChallanReadinessReport } from '@/lib/productivity/vehicle-challan-readiness'

export async function GET() {
  await requireAdmin()
  return NextResponse.json(getVehicleChallanReadinessReport())
}
