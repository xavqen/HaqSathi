import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/guards'
import { getRentDepositReadinessReport } from '@/lib/productivity/rent-deposit-readiness'

export async function GET() {
  await requireAdmin()
  return NextResponse.json(getRentDepositReadinessReport())
}
