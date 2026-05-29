import { NextRequest, NextResponse } from 'next/server'
import { createHmac, timingSafeEqual } from 'crypto'
import { db } from '@/lib/db'

export const runtime = 'nodejs'

type RazorpayPayload = {
  event?: string
  payload?: {
    payment?: { entity?: { id?: string; order_id?: string; status?: string } }
    order?: { entity?: { id?: string; status?: string } }
    refund?: { entity?: { payment_id?: string; status?: string } }
  }
}

function isValidSignature(rawBody: string, signature: string | null) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET
  if (!secret || !signature) return false
  const digest = createHmac('sha256', secret).update(rawBody).digest('hex')
  const a = Buffer.from(digest)
  const b = Buffer.from(signature)
  return a.length === b.length && timingSafeEqual(a, b)
}

async function activateSubscriptionForOrder(providerOrderId: string, providerPaymentId?: string) {
  const order = await db.paymentOrder.findFirst({ where: { providerOrderId } })
  if (!order) return false

  await db.paymentOrder.update({
    where: { id: order.id },
    data: { status: 'PAID', providerPaymentId: providerPaymentId || order.providerPaymentId }
  })
  if (order.userId) {
    await db.user.update({ where: { id: order.userId }, data: { plan: order.plan } })
    await db.subscription.upsert({
      where: { id: `sub_${order.id}` },
      update: { status: 'ACTIVE', plan: order.plan, provider: 'razorpay' },
      create: { id: `sub_${order.id}`, userId: order.userId, plan: order.plan, status: 'ACTIVE', provider: 'razorpay' }
    })
  }
  return true
}

async function markPaymentFailure(providerOrderId: string) {
  const order = await db.paymentOrder.findFirst({ where: { providerOrderId } })
  if (!order) return false
  await db.paymentOrder.update({ where: { id: order.id }, data: { status: 'FAILED' } })
  return true
}

export async function POST(req: NextRequest) {
  const raw = await req.text()
  const signature = req.headers.get('x-razorpay-signature')
  if (!isValidSignature(raw, signature)) return NextResponse.json({ ok: false, error: 'Invalid signature' }, { status: 401 })

  const payload = JSON.parse(raw) as RazorpayPayload
  const event = payload.event || 'unknown'
  const payment = payload.payload?.payment?.entity
  const orderEntity = payload.payload?.order?.entity
  const providerOrderId = payment?.order_id || orderEntity?.id

  let handled = false
  if ((event === 'payment.captured' || event === 'order.paid') && providerOrderId) {
    handled = await activateSubscriptionForOrder(providerOrderId, payment?.id)
  }
  if ((event === 'payment.failed' || payment?.status === 'failed') && providerOrderId) {
    handled = await markPaymentFailure(providerOrderId)
  }

  return NextResponse.json({ ok: true, event, handled })
}
