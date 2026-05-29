import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { buildChargebackHelper } from '@/lib/tools/phase31-advanced-generators'
import { chargebackHelperSchema } from '@/lib/validators/phase31'

export async function POST(req: NextRequest) {
  const json = await req.json().catch(() => null)
  const parsed = chargebackHelperSchema.safeParse(json)
  if (!parsed.success) return NextResponse.json({ ok: false, error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })
  const user = await getCurrentUser()
  const result = buildChargebackHelper(parsed.data)
  if (user) await db.chargebackHelperResult.create({ data: { userId: user.id, paymentMode: parsed.data.paymentMode, issueType: parsed.data.issueType, bankName: parsed.data.bankName, merchantName: parsed.data.merchantName, amount: parsed.data.amount || 0, readinessScore: result.readinessScore, result } }).catch(() => undefined)
  return NextResponse.json({ ok: true, result })
}
