import { NextRequest, NextResponse } from 'next/server'
import { getClientIp, rateLimitAsync } from '@/lib/rate-limit'
import { generateUPIHelp } from '@/lib/ai/helpers'
import { upiInputSchema } from '@/lib/validators/upi'
import { csrfGuard } from '@/lib/security/csrf'

export async function POST(req: NextRequest) {
  const csrf = csrfGuard(req)
  if (csrf) return csrf
  const ip = getClientIp(req.headers)
  if (!(await rateLimitAsync(`upi:${ip}`, 10, 60_000)).ok) return NextResponse.json({ ok: false, error: 'Too many requests' }, { status: 429 })
  const json = await req.json().catch(() => null)
  const parsed = upiInputSchema.safeParse(json)
  if (!parsed.success) return NextResponse.json({ ok: false, error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })
  return NextResponse.json({ ok: true, result: generateUPIHelp(parsed.data) })
}
