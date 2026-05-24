import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireUser } from '@/lib/auth/session'
import { caseTaskSchema } from '@/lib/validators/case-workspace'

export async function POST(req: NextRequest) {
  const user = await requireUser()
  const json = await req.json().catch(() => null)
  const parsed = caseTaskSchema.safeParse(json)
  if (!parsed.success) return NextResponse.json({ ok: false, error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })
  const task = await db.caseTask.create({
    data: {
      userId: user.id,
      complaintId: parsed.data.complaintId,
      title: parsed.data.title,
      priority: parsed.data.priority,
      dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
      notes: parsed.data.notes || null
    }
  })
  return NextResponse.json({ ok: true, task })
}

export async function PATCH(req: NextRequest) {
  const user = await requireUser()
  const json = await req.json().catch(() => null) as { id?: string; status?: 'TODO' | 'IN_PROGRESS' | 'DONE' | 'BLOCKED' } | null
  if (!json?.id || !json.status) return NextResponse.json({ ok: false, error: 'Task id and status required' }, { status: 400 })
  const task = await db.caseTask.updateMany({ where: { id: json.id, userId: user.id }, data: { status: json.status } })
  return NextResponse.json({ ok: true, updated: task.count })
}
