import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth/session'
import { safeJson } from '@/lib/api/errors'
import { ombudsmanPlannerSchema } from '@/lib/validators/advanced-tools'
import { buildOmbudsmanPlanner } from '@/lib/tools/advanced-generators'
import { rateLimit } from '@/lib/rate-limit'

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local'
  const limited = rateLimit(`ombudsman-planner:${ip}`, 8, 60_000)
  if (!limited.ok) return NextResponse.json({ ok: false, error: 'Too many requests. 1 minute baad try karo.' }, { status: 429 })
  const body = await safeJson<unknown>(req)
  const parsed = ombudsmanPlannerSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ ok: false, error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })
  const result = buildOmbudsmanPlanner(parsed.data)
  try {
    const user = await getCurrentUser()
    await db.legalToolResult.create({ data: { userId: user?.id, tool: 'OMBUDSMAN_PLANNER', input: parsed.data, result } })
  } catch (error) {
    console.error('ombudsman planner save failed', error)
  }
  return NextResponse.json({ ok: true, result })
}
