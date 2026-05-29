import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { buildProofQualityScan } from '@/lib/tools/phase31-advanced-generators'
import { proofQualityScannerSchema } from '@/lib/validators/phase31'

export async function POST(req: NextRequest) {
  const json = await req.json().catch(() => null)
  const parsed = proofQualityScannerSchema.safeParse(json)
  if (!parsed.success) return NextResponse.json({ ok: false, error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })
  const user = await getCurrentUser()
  const result = buildProofQualityScan(parsed.data)
  if (user) await db.proofQualityScan.create({ data: { userId: user.id, issueType: parsed.data.issueType, channel: parsed.data.channel, score: result.score, proofText: parsed.data.proofText, result } }).catch(() => undefined)
  return NextResponse.json({ ok: true, result })
}
