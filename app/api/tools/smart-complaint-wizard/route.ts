import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { buildSmartComplaintPlan } from '@/lib/tools/phase27-smart-wizard'
import { smartComplaintWizardSchema } from '@/lib/validators/phase27'

export async function POST(req: NextRequest) {
  const json = await req.json().catch(() => null)
  const parsed = smartComplaintWizardSchema.safeParse(json)
  if (!parsed.success) return NextResponse.json({ ok: false, error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })
  const user = await getCurrentUser()
  const result = buildSmartComplaintPlan(parsed.data)
  if (user) {
    await db.smartComplaintPlan.create({
      data: {
        userId: user.id,
        issueType: parsed.data.issueType,
        companyName: parsed.data.companyName || null,
        referenceId: parsed.data.referenceId || null,
        amount: parsed.data.amount || null,
        language: parsed.data.language || 'ENGLISH',
        urgency: parsed.data.urgency,
        readinessScore: result.readinessScore,
        plan: result
      }
    }).catch(() => undefined)
  }
  return NextResponse.json({ ok: true, result })
}
