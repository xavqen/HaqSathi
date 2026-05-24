import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth/session'
import { feedbackSchema } from '@/lib/validators/feedback'

export async function POST(req: NextRequest) {
  const user = await getCurrentUser()
  const json = await req.json().catch(() => null)
  const parsed = feedbackSchema.safeParse(json)
  if (!parsed.success) return NextResponse.json({ ok: false, error: 'Invalid feedback', details: parsed.error.flatten() }, { status: 400 })
  const item = await db.feedback.create({ data: { userId: user?.id, entity: parsed.data.entity, entityId: parsed.data.entityId || null, rating: parsed.data.rating, comment: parsed.data.comment || null } })
  return NextResponse.json({ ok: true, id: item.id })
}
