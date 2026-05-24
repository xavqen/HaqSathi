import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth/session'
import { supportTicketSchema } from '@/lib/validators/support'

export async function POST(req: NextRequest) {
  const json = await req.json().catch(() => null)
  const parsed = supportTicketSchema.safeParse(json)
  if (!parsed.success) return NextResponse.json({ ok: false, error: 'Invalid ticket details' }, { status: 400 })
  const user = await getCurrentUser()
  await db.supportTicket.create({ data: { userId: user?.id, ...parsed.data } })
  return NextResponse.json({ ok: true })
}
