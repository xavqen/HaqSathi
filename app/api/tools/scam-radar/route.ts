import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { buildScamRadarReport } from '@/lib/tools/phase29-unique-generators'
import { scamRadarSchema } from '@/lib/validators/phase29'

export async function POST(req: NextRequest) {
  const json = await req.json().catch(() => null)
  const parsed = scamRadarSchema.safeParse(json)
  if (!parsed.success) return NextResponse.json({ ok: false, error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })
  const user = await getCurrentUser()
  const result = buildScamRadarReport(parsed.data)
  if (user) await db.scamRadarReport.create({ data: { userId: user.id, channel: parsed.data.channel, counterparty: parsed.data.counterparty || null, amount: parsed.data.amount || null, messageText: parsed.data.messageText, riskLevel: result.riskLevel, score: result.score, report: result } }).catch(() => undefined)
  return NextResponse.json({ ok: true, result })
}
