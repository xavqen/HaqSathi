import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/session'
import { getAccountSecurityReadinessReport } from '@/lib/security/account-security'

export async function GET() {
  await requireAdmin()
  return NextResponse.json(getAccountSecurityReadinessReport())
}
