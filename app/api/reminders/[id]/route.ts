import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { requireUser } from '@/lib/auth/session'

const patchSchema = z.object({ status: z.enum(['PENDING', 'DONE', 'CANCELLED']) })

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser()
  const { id } = await params
  const json = await req.json().catch(() => null)
  const parsed = patchSchema.safeParse(json)
  if (!parsed.success) return NextResponse.json({ ok: false, error: 'Invalid input' }, { status: 400 })
  const result = await db.reminder.updateMany({ where: { id, userId: user.id }, data: { status: parsed.data.status } })
  if (!result.count) return NextResponse.json({ ok: false, error: 'Reminder not found' }, { status: 404 })
  return NextResponse.json({ ok: true })
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser()
  const { id } = await params
  const result = await db.reminder.deleteMany({ where: { id, userId: user.id } })
  if (!result.count) return NextResponse.json({ ok: false, error: 'Reminder not found' }, { status: 404 })
  return NextResponse.json({ ok: true })
}
