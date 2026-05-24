import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/session'
import { getSecurityHardeningChecks } from '@/lib/launch/security-hardening'

export async function GET() {
  await requireAdmin()
  const items = getSecurityHardeningChecks()
  return NextResponse.json({ ok: true, items, passed: items.filter((item) => item.ok).length, total: items.length })
}
