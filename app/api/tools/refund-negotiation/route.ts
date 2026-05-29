import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { buildRefundNegotiationPlan } from '@/lib/tools/phase29-unique-generators'
import { refundNegotiationSchema } from '@/lib/validators/phase29'

export async function POST(req: NextRequest) {
  const json = await req.json().catch(() => null)
  const parsed = refundNegotiationSchema.safeParse(json)
  if (!parsed.success) return NextResponse.json({ ok: false, error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })
  const user = await getCurrentUser()
  const result = buildRefundNegotiationPlan(parsed.data)
  if (user) await db.refundNegotiationPlan.create({ data: { userId: user.id, companyName: parsed.data.companyName || null, issueType: parsed.data.issueType, amount: parsed.data.amount || null, tone: parsed.data.tone, plan: result } }).catch(() => undefined)
  return NextResponse.json({ ok: true, result })
}
