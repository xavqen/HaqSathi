import { NextRequest, NextResponse } from 'next/server'
import { createHmac, timingSafeEqual } from 'crypto'
import { db } from '@/lib/db'

export const runtime = 'nodejs'

function isValidSignature(rawBody: string, signature: string | null) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET
  if (!secret || !signature) return false
  const digest = createHmac('sha256', secret).update(rawBody).digest('hex')
  const a = Buffer.from(digest)
  const b = Buffer.from(signature)
  return a.length === b.length && timingSafeEqual(a, b)
}

export async function POST(req: NextRequest) {
  const raw = await req.text()
  const signature = req.headers.get('x-razorpay-signature')
  if (!isValidSignature(raw, signature)) return NextResponse.json({ ok: false, error: 'Invalid signature' }, { status: 401 })

  const payload = JSON.parse(raw) as { event?: string; payload?: { payment?: { entity?: { order_id?: string } } } }
  const providerOrderId = payload.payload?.payment?.entity?.order_id
  if (payload.event === 'payment.captured' && providerOrderId) {
    const order = await db.paymentOrder.findFirst({ where: { providerOrderId } })
    if (order) {
      await db.paymentOrder.update({ where: { id: order.id }, data: { status: 'PAID' } })
      if (order.userId) await db.user.update({ where: { id: order.userId }, data: { plan: order.plan } })
    }
  }

  return NextResponse.json({ ok: true })
}
