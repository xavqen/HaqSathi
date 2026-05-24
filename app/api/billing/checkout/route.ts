import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { requireUser } from '@/lib/auth/session'

export const runtime = 'nodejs'

const schema = z.object({ plan: z.enum(['PRO', 'FAMILY', 'AGENT', 'FREE']) })
const amountMap = { FREE: 0, PRO: 9900, FAMILY: 29900, AGENT: 99900 }

async function createRazorpayOrder({ amount, receipt, plan, userId }: { amount: number; receipt: string; plan: string; userId: string }) {
  const keyId = process.env.RAZORPAY_KEY_ID
  const keySecret = process.env.RAZORPAY_KEY_SECRET
  if (!keyId || !keySecret) return null

  const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64')
  const response = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount, currency: 'INR', receipt, notes: { plan, userId, localOrderId: receipt } })
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data?.error?.description || data?.message || 'Razorpay order failed')
  return data as { id: string; amount: number; currency: string }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser()
    const json = await req.json().catch(() => null)
    const parsed = schema.safeParse(json)
    if (!parsed.success) return NextResponse.json({ ok: false, error: 'Invalid plan' }, { status: 400 })
    if (parsed.data.plan === 'FREE') return NextResponse.json({ ok: false, error: 'Free plan does not need checkout' }, { status: 400 })

    const localOrder = await db.paymentOrder.create({ data: { userId: user.id, plan: parsed.data.plan, amount: amountMap[parsed.data.plan] } })
    const providerOrder = await createRazorpayOrder({ amount: localOrder.amount, receipt: localOrder.id, plan: parsed.data.plan, userId: user.id })

    const updated = providerOrder ? await db.paymentOrder.update({ where: { id: localOrder.id }, data: { providerOrderId: providerOrder.id } }) : localOrder
    return NextResponse.json({
      ok: true,
      mode: providerOrder ? 'razorpay' : 'dry-run',
      appOrderId: updated.id,
      providerOrderId: providerOrder?.id || null,
      amount: updated.amount,
      currency: updated.currency,
      providerKeyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || null,
      plan: updated.plan,
      user: { name: user.name, email: user.email }
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Checkout failed'
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
