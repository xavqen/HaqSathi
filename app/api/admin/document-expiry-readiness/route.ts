import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/session'
import { getDocumentExpiryReadinessReport } from '@/lib/documents/document-expiry-readiness'

export async function GET() {
  await requireAdmin()
  return NextResponse.json(getDocumentExpiryReadinessReport())
}
