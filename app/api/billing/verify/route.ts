import { NextRequest, NextResponse } from 'next/server'
import { createHmac, timingSafeEqual } from 'crypto'
import { z } from 'zod'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth/session'
import { csrfGuard } from '@/lib/security/csrf'
import { getClientIp, rateLimitAsync } from '@/lib/rate-limit'
import { buildLoginPath } from '@/lib/security/redirect'

export const runtime = 'nodejs'

const schema = z.object({
  appOrderId: z.string().min(1),
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1)
})

function verifyPaymentSignature(orderId: string, paymentId: string, signature: string) {
  const secret = process.env.RAZORPAY_KEY_SECRET
  if (!secret) return false
  const digest = createHmac('sha256', secret).update(`${orderId}|${paymentId}`).digest('hex')
  const a = Buffer.from(digest)
  const b = Buffer.from(signature)
  return a.length === b.length && timingSafeEqual(a, b)
}

export async function POST(req: NextRequest) {
  try {
    const csrf = csrfGuard(req)
    if (csrf) return csrf
    const ip = getClientIp(req.headers)
    if (!(await rateLimitAsync(`billing-verify:${ip}`, 15, 60_000)).ok) return NextResponse.json({ ok: false, error: 'Too many payment verification attempts.' }, { status: 429 })
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ ok: false, error: 'Login required to verify payment.', loginPath: buildLoginPath('/dashboard/billing') }, { status: 401 })
    const json = await req.json().catch(() => null)
    const parsed = schema.safeParse(json)
    if (!parsed.success) return NextResponse.json({ ok: false, error: 'Invalid payment payload' }, { status: 400 })

    const order = await db.paymentOrder.findFirst({ where: { id: parsed.data.appOrderId, userId: user.id } })
    if (!order || order.providerOrderId !== parsed.data.razorpay_order_id) return NextResponse.json({ ok: false, error: 'Payment order mismatch' }, { status: 400 })
    if (!verifyPaymentSignature(parsed.data.razorpay_order_id, parsed.data.razorpay_payment_id, parsed.data.razorpay_signature)) return NextResponse.json({ ok: false, error: 'Invalid payment signature' }, { status: 401 })

    await db.paymentOrder.update({ where: { id: order.id }, data: { status: 'PAID', providerPaymentId: parsed.data.razorpay_payment_id, providerSignature: parsed.data.razorpay_signature } })
    await db.user.update({ where: { id: user.id }, data: { plan: order.plan } })
    await db.subscription.upsert({
      where: { id: `sub_${order.id}` },
      update: { status: 'ACTIVE', plan: order.plan, provider: 'razorpay' },
      create: { id: `sub_${order.id}`, userId: user.id, plan: order.plan, status: 'ACTIVE', provider: 'razorpay' }
    })

    return NextResponse.json({ ok: true, plan: order.plan })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Payment verify failed'
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
