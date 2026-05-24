import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/session'
import { getSeoAudit } from '@/lib/launch/seo-audit'

export async function GET() {
  await requireAdmin()
  const items = await getSeoAudit()
  return NextResponse.json({ ok: true, items, passed: items.filter((item) => item.ok).length, total: items.length })
}
