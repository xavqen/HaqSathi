import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { requireUser } from '@/lib/auth/session'

const schema = z.object({ status: z.enum(['DRAFT', 'SENT', 'FOLLOW_UP', 'RESOLVED', 'CLOSED']) })

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser()
  const { id } = await params
  const json = await req.json().catch(() => null)
  const parsed = schema.safeParse(json)
  if (!parsed.success) return NextResponse.json({ ok: false, error: 'Invalid status' }, { status: 400 })

  const updated = await db.complaint.updateMany({ where: { id, userId: user.id }, data: { status: parsed.data.status } })
  if (!updated.count) return NextResponse.json({ ok: false, error: 'Complaint not found' }, { status: 404 })
  return NextResponse.json({ ok: true })
}
