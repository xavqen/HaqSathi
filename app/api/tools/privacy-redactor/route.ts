import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { buildPrivacyRedaction } from '@/lib/tools/phase30-trust-growth-generators'
import { privacyRedactorSchema } from '@/lib/validators/phase30'

export async function POST(req: NextRequest) {
  const json = await req.json().catch(() => null)
  const parsed = privacyRedactorSchema.safeParse(json)
  if (!parsed.success) return NextResponse.json({ ok: false, error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })
  const user = await getCurrentUser()
  const result = buildPrivacyRedaction(parsed.data)
  if (user) await db.privacyRedactionResult.create({ data: { userId: user.id, contentType: parsed.data.contentType, language: parsed.data.language, publicShareMode: parsed.data.publicShareMode, riskScore: result.riskScore, originalText: parsed.data.text, redactedText: result.safeText, result } }).catch(() => undefined)
  return NextResponse.json({ ok: true, result })
}
