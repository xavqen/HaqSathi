import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/session'
import { getSecretsReadinessReport } from '@/lib/security/secrets-readiness'

export async function GET() {
  await requireAdmin()
  return NextResponse.json(getSecretsReadinessReport())
}
