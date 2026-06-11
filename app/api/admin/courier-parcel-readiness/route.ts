import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/guards'
import { getCourierParcelReadinessReport } from '@/lib/productivity/courier-parcel-readiness'

export async function GET() {
  await requireAdmin()
  return NextResponse.json(getCourierParcelReadinessReport())
}
