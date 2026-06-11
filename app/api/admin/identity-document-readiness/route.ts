import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/guards'
import { getIdentityDocumentReadinessReport } from '@/lib/productivity/identity-document-readiness'

export async function GET() {
  await requireAdmin()
  return NextResponse.json(getIdentityDocumentReadinessReport())
}
