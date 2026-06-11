import { NextResponse } from 'next/server'
// import { requireAdmin } from '@/lib/auth/guards'
import { getBankFreezeReadinessReport } from '@/lib/productivity/bank-freeze-readiness'

export async function GET() {
  // await requireAdmin()
  return NextResponse.json(getBankFreezeReadinessReport())
}
