import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireUser } from '@/lib/auth/session'
import { agentInvoiceSchema } from '@/lib/validators/phase14'

export async function POST(req: Request) {
  try {
    const user = await requireUser()
    const json = await req.json()
    const parsed = agentInvoiceSchema.safeParse(json)
    if (!parsed.success) return NextResponse.json({ ok: false, error: parsed.error.issues[0]?.message || 'Invalid input' }, { status: 400 })

    const invoice = await db.agentInvoice.create({
      data: {
        userId: user.id,
        agentClientId: parsed.data.agentClientId || null,
        clientName: parsed.data.clientName,
        serviceName: parsed.data.serviceName,
        amount: parsed.data.amount,
        notes: parsed.data.notes || null
      }
    })
    return NextResponse.json({ ok: true, invoice })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ ok: false, error: 'Invoice save failed' }, { status: 500 })
  }
}
