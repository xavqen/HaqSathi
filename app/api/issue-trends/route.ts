import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { summarizeTrend } from '@/lib/tools/phase29-unique-generators'
import { issueTrendSchema } from '@/lib/validators/phase29'

export async function GET() {
  const rows = await db.issueTrendSignal.groupBy({ by: ['issueType', 'companyName', 'severity'], _count: { issueType: true }, orderBy: { _count: { issueType: 'desc' } }, take: 30 }).catch(() => [])
  return NextResponse.json({ ok: true, trends: rows })
}

export async function POST(req: NextRequest) {
  const json = await req.json().catch(() => null)
  const parsed = issueTrendSchema.safeParse(json)
  if (!parsed.success) return NextResponse.json({ ok: false, error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })
  const user = await getCurrentUser()
  const result = summarizeTrend(parsed.data)
  await db.issueTrendSignal.create({ data: { userId: user?.id || null, issueType: parsed.data.issueType, companyName: parsed.data.companyName || null, state: parsed.data.state || null, city: parsed.data.city || null, severity: parsed.data.severity, summary: parsed.data.summary } }).catch(() => undefined)
  return NextResponse.json({ ok: true, result })
}
