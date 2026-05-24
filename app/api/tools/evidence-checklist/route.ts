import { NextRequest, NextResponse } from 'next/server'
import { buildEvidenceChecklist } from '@/lib/case-intelligence'
import { evidenceChecklistSchema } from '@/lib/validators/tools'

export async function POST(req: NextRequest) {
  const json = await req.json().catch(() => null)
  const parsed = evidenceChecklistSchema.safeParse(json)
  if (!parsed.success) return NextResponse.json({ ok: false, error: 'Invalid input' }, { status: 400 })
  return NextResponse.json({ ok: true, checklist: buildEvidenceChecklist(parsed.data.category) })
}
