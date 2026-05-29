import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { buildFamilyCaseSwitchboard } from '@/lib/tools/phase31-advanced-generators'
import { familyCaseSwitchboardSchema } from '@/lib/validators/phase31'

export async function POST(req: NextRequest) {
  const json = await req.json().catch(() => null)
  const parsed = familyCaseSwitchboardSchema.safeParse(json)
  if (!parsed.success) return NextResponse.json({ ok: false, error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })
  const user = await getCurrentUser()
  const result = buildFamilyCaseSwitchboard(parsed.data)
  if (user) await db.familyCaseSwitchboard.create({ data: { userId: user.id, memberName: parsed.data.memberName, issueType: parsed.data.issueType, priority: parsed.data.priority, result } }).catch(() => undefined)
  return NextResponse.json({ ok: true, result })
}
