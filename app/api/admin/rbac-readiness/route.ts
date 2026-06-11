import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/session'
import { getRbacReadinessReport } from '@/lib/security/admin-rbac'

export async function GET() {
  await requireAdmin()
  return NextResponse.json(getRbacReadinessReport())
}
