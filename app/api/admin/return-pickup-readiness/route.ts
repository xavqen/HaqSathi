import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/guards'
import { getReturnPickupReadinessReport } from '@/lib/productivity/return-pickup-readiness'

export async function GET() {
  await requireAdmin()
  return NextResponse.json(getReturnPickupReadinessReport())
}
