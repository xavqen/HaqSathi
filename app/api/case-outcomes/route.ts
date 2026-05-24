import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireUser } from '@/lib/auth/session'
import { caseOutcomeSchema } from '@/lib/validators/phase13'

export async function POST(req: NextRequest) {
  const user = await requireUser()
  const json = await req.json().catch(() => null)
  const parsed = caseOutcomeSchema.safeParse(json)
  if (!parsed.success) return NextResponse.json({ ok: false, error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })
  const data = parsed.data
  const outcome = await db.caseOutcome.create({
    data: {
      userId: user.id,
      complaintId: data.complaintId || null,
      outcomeType: data.outcomeType,
      amountRecovered: data.amountRecovered === '' || data.amountRecovered === undefined ? null : data.amountRecovered,
      resolutionDate: data.resolutionDate ? new Date(data.resolutionDate) : null,
      summary: data.summary,
      learning: data.learning || null,
      publicStory: Boolean(data.publicStory)
    }
  })
  return NextResponse.json({ ok: true, outcome })
}
