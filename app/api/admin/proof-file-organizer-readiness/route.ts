import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/session'
import { getProofFileOrganizerReadinessReport } from '@/lib/productivity/proof-file-organizer-readiness'

export async function GET() {
  await requireAdmin()
  return NextResponse.json(getProofFileOrganizerReadinessReport())
}
