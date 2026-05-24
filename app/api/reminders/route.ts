import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireUser } from '@/lib/auth/session'
import { reminderSchema } from '@/lib/validators/reminder'

export async function POST(req: NextRequest) {
  const user = await requireUser()
  const json = await req.json().catch(() => null)
  const parsed = reminderSchema.safeParse(json)
  if (!parsed.success) return NextResponse.json({ ok: false, error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })

  const reminder = await db.reminder.create({ data: { userId: user.id, title: parsed.data.title, dueDate: new Date(parsed.data.dueDate), relatedComplaintId: parsed.data.relatedComplaintId || null } })
  return NextResponse.json({ ok: true, reminder })
}
