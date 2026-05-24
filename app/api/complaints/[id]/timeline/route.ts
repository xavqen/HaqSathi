import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireUser } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { logActivity } from '@/lib/activity'

const schema = z.object({ title: z.string().min(2).max(140), message: z.string().max(1000).optional(), type: z.string().default('NOTE'), dueDate: z.string().optional() })

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser()
  const { id } = await params
  const complaint = await db.complaint.findFirst({ where: { id, userId: user.id }, select: { id: true } })
  if (!complaint) return NextResponse.json({ ok: false, error: 'Complaint not found' }, { status: 404 })
  const json = await req.json().catch(() => null)
  const parsed = schema.safeParse(json)
  if (!parsed.success) return NextResponse.json({ ok: false, error: 'Invalid timeline event' }, { status: 400 })
  const event = await db.caseTimelineEvent.create({ data: { userId: user.id, complaintId: id, title: parsed.data.title, message: parsed.data.message, type: parsed.data.type, dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null } })
  await logActivity({ userId: user.id, action: 'CREATE', entity: 'CaseTimelineEvent', entityId: event.id, metadata: { complaintId: id } })
  return NextResponse.json({ ok: true, event })
}
