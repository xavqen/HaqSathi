import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { hashPassword } from '@/lib/auth/password'
import { consumePasswordResetToken } from '@/lib/auth/password-reset'
import { createSession } from '@/lib/auth/session'
import { getClientIp, rateLimitAsync } from '@/lib/rate-limit'
import { csrfGuard } from '@/lib/security/csrf'

const schema = z.object({ token: z.string().min(32), password: z.string().min(8).max(120) })

export async function POST(req: NextRequest) {
  const csrf = csrfGuard(req)
  if (csrf) return csrf
  const ip = getClientIp(req.headers)
  if (!(await rateLimitAsync(`reset:${ip}`, 8, 60_000)).ok) return NextResponse.json({ ok: false, error: 'Too many requests. Try again after 1 minute.' }, { status: 429 })
  const json = await req.json().catch(() => null)
  const parsed = schema.safeParse(json)
  if (!parsed.success) return NextResponse.json({ ok: false, error: 'Invalid reset request.' }, { status: 400 })

  const user = await consumePasswordResetToken(parsed.data.token)
  if (!user) return NextResponse.json({ ok: false, error: 'Reset link expired ya invalid hai.' }, { status: 400 })

  await db.user.update({ where: { id: user.id }, data: { password: hashPassword(parsed.data.password) } })
  await createSession(user.id)
  return NextResponse.json({ ok: true })
}
