import { NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { buildEscalationPlan } from '@/lib/case-intelligence'
import { logActivity } from '@/lib/activity'

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser()
  const { id } = await params
  const complaint = await db.complaint.findFirst({ where: { id, userId: user.id } })
  if (!complaint) return NextResponse.json({ ok: false, error: 'Complaint not found' }, { status: 404 })
  const plan = buildEscalationPlan({ category: complaint.type, createdAt: complaint.createdAt, amount: complaint.amount?.toString(), companyName: complaint.companyName, description: complaint.description })
  const first = plan[0]
  const saved = await db.escalationPlan.create({ data: { userId: user.id, complaintId: id, currentStage: first.title, nextAction: first.action, dueDate: new Date(first.dueDate), generatedPlan: plan } })
  await db.caseTimelineEvent.create({ data: { userId: user.id, complaintId: id, type: 'ESCALATION_PLAN', title: 'Escalation plan generated', message: first.action, dueDate: new Date(first.dueDate), metadata: { planId: saved.id } } }).catch(() => undefined)
  await logActivity({ userId: user.id, action: 'CREATE', entity: 'EscalationPlan', entityId: saved.id, metadata: { complaintId: id } })
  return NextResponse.json({ ok: true, plan, savedId: saved.id })
}
