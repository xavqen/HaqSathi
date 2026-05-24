import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth/session'
import { templateCreateSchema } from '@/lib/validators/template'
import { logActivity } from '@/lib/activity'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin()
  const { id } = await params
  const json = await req.json().catch(() => null)
  const parsed = templateCreateSchema.safeParse(json)
  if (!parsed.success) return NextResponse.json({ ok: false, error: 'Invalid template', details: parsed.error.flatten() }, { status: 400 })
  const template = await db.template.update({ where: { id }, data: parsed.data })
  await logActivity({ userId: admin.id, action: 'UPDATE', entity: 'Template', entityId: template.id })
  return NextResponse.json({ ok: true, template })
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin()
  const { id } = await params
  await db.template.delete({ where: { id } })
  await logActivity({ userId: admin.id, action: 'DELETE', entity: 'Template', entityId: id })
  return NextResponse.json({ ok: true })
}
