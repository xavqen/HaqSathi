import { NextRequest, NextResponse } from 'next/server'
import { assessRisk } from '@/lib/case-intelligence'
import { riskAssessmentSchema } from '@/lib/validators/tools'
import { getCurrentUser } from '@/lib/auth/session'
import { db } from '@/lib/db'

export async function POST(req: NextRequest) {
  const json = await req.json().catch(() => null)
  const parsed = riskAssessmentSchema.safeParse(json)
  if (!parsed.success) return NextResponse.json({ ok: false, error: 'Invalid input' }, { status: 400 })
  const result = assessRisk(parsed.data)
  const user = await getCurrentUser()
  await db.riskAssessment.create({ data: { userId: user?.id, tool: 'risk-assessment', input: parsed.data, result, riskLevel: result.level as any } }).catch(() => undefined)
  return NextResponse.json({ ok: true, result })
}
