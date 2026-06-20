import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { buildCaseCoachReport } from '@/lib/tools/phase24-generators'
import { caseCoachSchema } from '@/lib/validators/phase24'

export async function POST(req: NextRequest) {
  const json = await req.json().catch(() => null)
  const parsed = caseCoachSchema.safeParse(json)
  if (!parsed.success) return NextResponse.json({ ok: false, error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })
  const user = await getCurrentUser()
  const result = buildCaseCoachReport(parsed.data)
  if (user) {
    await db.caseCoachReport.create({
      data: {
        userId: user.id,
        complaintId: parsed.data.complaintId || null,
        caseType: parsed.data.caseType,
        score: result.score,
        grade: result.grade,
        report: result
      }
    }).catch(() => undefined)
  }
  return NextResponse.json({ ok: true, result })
}
