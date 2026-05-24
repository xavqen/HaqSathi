import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth/session'
import { safeJson } from '@/lib/api/errors'
import { bankEscalationSchema } from '@/lib/validators/advanced-tools'
import { buildBankEscalationPlan } from '@/lib/tools/advanced-generators'
import { rateLimit } from '@/lib/rate-limit'

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local'
  const limited = rateLimit(`bank-escalation:${ip}`, 10, 60_000)
  if (!limited.ok) return NextResponse.json({ ok: false, error: 'Too many requests. 1 minute baad try karo.' }, { status: 429 })
  const body = await safeJson<unknown>(req)
  const parsed = bankEscalationSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ ok: false, error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })
  const result = buildBankEscalationPlan(parsed.data)
  try {
    const user = await getCurrentUser()
    await db.legalToolResult.create({ data: { userId: user?.id, tool: 'BANK_ESCALATION', input: parsed.data, result } })
  } catch (error) {
    console.error('bank escalation save failed', error)
  }
  return NextResponse.json({ ok: true, result })
}
