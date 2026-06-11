import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/guards'
import { getLostDocumentReadinessReport } from '@/lib/productivity/lost-document-readiness'

export async function GET() {
  await requireAdmin()
  return NextResponse.json(getLostDocumentReadinessReport())
}
