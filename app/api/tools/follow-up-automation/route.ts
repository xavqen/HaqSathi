import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { buildFollowUpAutomation } from '@/lib/tools/phase24-generators'
import { followUpAutomationSchema } from '@/lib/validators/phase24'

export async function POST(req: NextRequest) {
  const json = await req.json().catch(() => null)
  const parsed = followUpAutomationSchema.safeParse(json)
  if (!parsed.success) return NextResponse.json({ ok: false, error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })
  const user = await getCurrentUser()
  const result = buildFollowUpAutomation(parsed.data)
  if (user) {
    await db.followUpAutomation.create({
      data: {
        userId: user.id,
        complaintId: parsed.data.complaintId || null,
        caseTitle: parsed.data.caseTitle,
        channel: parsed.data.channel,
        plan: result
      }
    }).catch(() => undefined)
    await Promise.all((result.remindersToCreate || []).slice(0, 5).map((item) => db.reminder.create({
      data: { userId: user.id, title: `${parsed.data.caseTitle}: ${item.title}`, dueDate: new Date(item.dueDate), status: 'PENDING', relatedComplaintId: parsed.data.complaintId || null }
    }).catch(() => undefined)))
  }
  return NextResponse.json({ ok: true, result })
}
