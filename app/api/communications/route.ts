import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireUser } from '@/lib/auth/session'
import { communicationLogSchema } from '@/lib/validators/phase13'

export async function POST(req: NextRequest) {
  const user = await requireUser()
  const json = await req.json().catch(() => null)
  const parsed = communicationLogSchema.safeParse(json)
  if (!parsed.success) return NextResponse.json({ ok: false, error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })
  const data = parsed.data
  const item = await db.communicationLog.create({
    data: {
      userId: user.id,
      complaintId: data.complaintId || null,
      channel: data.channel,
      recipientName: data.recipientName,
      recipientContact: data.recipientContact || null,
      subject: data.subject,
      message: data.message,
      direction: data.direction,
      status: data.status,
      nextFollowUpAt: data.nextFollowUpAt ? new Date(data.nextFollowUpAt) : null
    }
  })
  return NextResponse.json({ ok: true, item })
}
