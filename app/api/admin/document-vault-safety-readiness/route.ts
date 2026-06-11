import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/session'
import { getDocumentVaultSafetyReadinessReport } from '@/lib/security/document-vault-safety'

export async function GET() {
  await requireAdmin()
  return NextResponse.json(getDocumentVaultSafetyReadinessReport())
}
