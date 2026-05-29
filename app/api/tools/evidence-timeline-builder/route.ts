import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { buildEvidenceTimeline } from '@/lib/tools/phase30-trust-growth-generators'
import { evidenceTimelineSchema } from '@/lib/validators/phase30'

export async function POST(req: NextRequest) {
  const json = await req.json().catch(() => null)
  const parsed = evidenceTimelineSchema.safeParse(json)
  if (!parsed.success) return NextResponse.json({ ok: false, error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })
  const user = await getCurrentUser()
  const result = buildEvidenceTimeline(parsed.data)
  if (user) await db.evidenceTimelineBuild.create({ data: { userId: user.id, issueType: parsed.data.issueType, companyName: parsed.data.companyName || null, referenceId: parsed.data.referenceId || null, readinessScore: result.readinessScore, eventsText: parsed.data.eventsText, evidenceText: parsed.data.evidenceText || null, result } }).catch(() => undefined)
  return NextResponse.json({ ok: true, result })
}
