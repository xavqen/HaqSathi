import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { buildAuthorityRouter } from '@/lib/tools/phase29-unique-generators'
import { authorityRouterSchema } from '@/lib/validators/phase29'

export async function POST(req: NextRequest) {
  const json = await req.json().catch(() => null)
  const parsed = authorityRouterSchema.safeParse(json)
  if (!parsed.success) return NextResponse.json({ ok: false, error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })
  const user = await getCurrentUser()
  const result = buildAuthorityRouter(parsed.data)
  if (user) await db.authorityRouterPlan.create({ data: { userId: user.id, issueType: parsed.data.issueType, companyType: parsed.data.companyType, state: parsed.data.state || null, urgency: parsed.data.urgency, plan: result } }).catch(() => undefined)
  return NextResponse.json({ ok: true, result })
}
