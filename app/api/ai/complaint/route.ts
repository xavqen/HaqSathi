import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { rateLimit } from '@/lib/rate-limit'
import { generateComplaintDraft } from '@/lib/ai/providers'
import { complaintInputSchema } from '@/lib/validators/complaint'
import { getCurrentUser } from '@/lib/auth/session'
import { assertCanUseAi, recordAiUsage } from '@/lib/billing/usage'
import { logActivity } from '@/lib/activity'
import { complaintEmailHtml, sendTransactionalEmail } from '@/lib/email/service'
import { buildEscalationPlan } from '@/lib/case-intelligence'

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local'
  const limited = rateLimit(`complaint:${ip}`, 8, 60_000)
  if (!limited.ok) {
    return NextResponse.json({ ok: false, error: 'Too many requests. 1 minute baad try karo.' }, { status: 429 })
  }

  const json = await req.json().catch(() => null)
  const parsed = complaintInputSchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })
  }

  const user = await getCurrentUser()
  const quota = await assertCanUseAi(user, 'complaint')
  if (!quota.ok) {
    return NextResponse.json({ ok: false, error: quota.message }, { status: 402 })
  }

  const { data: draft, provider } = await generateComplaintDraft(parsed.data)
  await recordAiUsage(user, 'complaint')
  let savedId: string | undefined

  try {
    const saved = await db.complaint.create({
      data: {
        userId: user?.id,
        type: parsed.data.type,
        companyName: parsed.data.companyName,
        transactionId: parsed.data.transactionId || null,
        amount: parsed.data.amount ? parsed.data.amount : undefined,
        issueDate: parsed.data.issueDate ? new Date(parsed.data.issueDate) : null,
        description: parsed.data.description,
        generatedDraft: draft
      },
      select: { id: true }
    })
    savedId = saved.id
    const plan = buildEscalationPlan({ category: parsed.data.type, createdAt: new Date(), amount: parsed.data.amount, companyName: parsed.data.companyName, description: parsed.data.description })
    await db.caseTimelineEvent.createMany({ data: [
      { userId: user?.id, complaintId: saved.id, type: 'CREATED', title: 'Complaint draft created', message: `Draft generated for ${parsed.data.companyName}` },
      { userId: user?.id, complaintId: saved.id, type: 'NEXT_ACTION', title: plan[0].title, message: plan[0].action, dueDate: new Date(plan[0].dueDate), metadata: { channel: plan[0].channel } }
    ] }).catch(() => undefined)
    await logActivity({ userId: user?.id, action: 'CREATE', entity: 'Complaint', entityId: saved.id, metadata: { type: parsed.data.type, companyName: parsed.data.companyName } })
    if (user?.email) {
      await sendTransactionalEmail({ to: user.email, subject: 'Your HaqSathi complaint draft is saved', template: 'COMPLAINT_SAVED', userId: user.id, html: complaintEmailHtml(user.name || 'User', parsed.data.companyName), text: 'Your HaqSathi complaint draft is saved in your dashboard.' })
    }
  } catch (error) {
    console.error('Complaint save failed:', error)
  }

  return NextResponse.json({ ok: true, draft, savedId, provider })
}
