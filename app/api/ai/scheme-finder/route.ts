import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getClientIp, rateLimitAsync } from '@/lib/rate-limit'
import { generateSchemeSuggestions } from '@/lib/ai/helpers'
import { schemeInputSchema } from '@/lib/validators/scheme'
import { getCurrentUser } from '@/lib/auth/session'
import { csrfGuard } from '@/lib/security/csrf'

export async function POST(req: NextRequest) {
  const csrf = csrfGuard(req)
  if (csrf) return csrf
  const ip = getClientIp(req.headers)
  if (!(await rateLimitAsync(`scheme:${ip}`, 10, 60_000)).ok) return NextResponse.json({ ok: false, error: 'Too many requests' }, { status: 429 })
  const json = await req.json().catch(() => null)
  const parsed = schemeInputSchema.safeParse(json)
  if (!parsed.success) return NextResponse.json({ ok: false, error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })
  const result = generateSchemeSuggestions(parsed.data)
  const user = await getCurrentUser()
  try {
    await db.schemeSearch.create({ data: { userId: user?.id, state: parsed.data.state, age: parsed.data.age, category: parsed.data.category || null, incomeRange: parsed.data.incomeRange, purpose: parsed.data.purpose, result } })
  } catch (e) { console.error('Scheme save failed', e) }
  return NextResponse.json({ ok: true, result })
}
