import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { buildRightsExplainer } from '@/lib/tools/phase29-unique-generators'
import { rightsExplainerSchema } from '@/lib/validators/phase29'

export async function POST(req: NextRequest) {
  const json = await req.json().catch(() => null)
  const parsed = rightsExplainerSchema.safeParse(json)
  if (!parsed.success) return NextResponse.json({ ok: false, error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })
  const user = await getCurrentUser()
  const result = buildRightsExplainer(parsed.data)
  if (user) await db.rightsExplainerResult.create({ data: { userId: user.id, issueType: parsed.data.issueType, state: parsed.data.state || null, language: parsed.data.language || 'ENGLISH', question: parsed.data.question, result } }).catch(() => undefined)
  return NextResponse.json({ ok: true, result })
}
