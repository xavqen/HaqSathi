import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/session'
import { getRealDeviceQaReadinessReport } from '@/lib/device-qa/readiness'

export async function GET() {
  await requireAdmin()
  return NextResponse.json(getRealDeviceQaReadinessReport())
}
