import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { buildPublicPostSafety } from '@/lib/tools/phase30-trust-growth-generators'
import { publicPostSafetySchema } from '@/lib/validators/phase30'

export async function POST(req: NextRequest) {
  const json = await req.json().catch(() => null)
  const parsed = publicPostSafetySchema.safeParse(json)
  if (!parsed.success) return NextResponse.json({ ok: false, error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })
  const user = await getCurrentUser()
  const result = buildPublicPostSafety(parsed.data)
  if (user) await db.publicPostSafetyCheck.create({ data: { userId: user.id, platform: parsed.data.platform, issueType: parsed.data.issueType, companyName: parsed.data.companyName || null, riskScore: result.riskScore, draftPost: parsed.data.draftPost, safePost: result.recommendedPost, result } }).catch(() => undefined)
  return NextResponse.json({ ok: true, result })
}
