import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireUser } from '@/lib/auth/session'
import { profileUpdateSchema } from '@/lib/validators/profile'

export async function PATCH(req: NextRequest) {
  const user = await requireUser()
  const json = await req.json().catch(() => null)
  const parsed = profileUpdateSchema.safeParse(json)
  if (!parsed.success) return NextResponse.json({ ok: false, error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })
  const updated = await db.user.update({ where: { id: user.id }, data: { name: parsed.data.name }, select: { name: true } })
  return NextResponse.json({ ok: true, user: updated })
}
