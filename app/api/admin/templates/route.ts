import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth/session'
import { templateCreateSchema } from '@/lib/validators/template'
import { logActivity } from '@/lib/activity'

export async function POST(req: NextRequest) {
  const admin = await requireAdmin()
  const json = await req.json().catch(() => null)
  const parsed = templateCreateSchema.safeParse(json)
  if (!parsed.success) return NextResponse.json({ ok: false, error: 'Invalid template', details: parsed.error.flatten() }, { status: 400 })
  const template = await db.template.upsert({ where: { slug: parsed.data.slug }, update: parsed.data, create: parsed.data })
  await logActivity({ userId: admin.id, action: 'UPSERT', entity: 'Template', entityId: template.id })
  return NextResponse.json({ ok: true, template })
}
