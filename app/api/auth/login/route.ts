import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { rateLimit } from '@/lib/rate-limit'
import { loginSchema } from '@/lib/validators/auth'
import { verifyPassword } from '@/lib/auth/password'
import { createSession } from '@/lib/auth/session'
import { logActivity } from '@/lib/activity'
import { dbErrorResponse, safeJson } from '@/lib/api/errors'

export async function POST(req: NextRequest) {
  try {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local'
  if (!rateLimit(`login:${ip}`, 8, 60_000).ok) {
    return NextResponse.json({ ok: false, error: 'Too many attempts. 1 minute baad try karo.' }, { status: 429 })
  }

  const json = await safeJson(req)
  const parsed = loginSchema.safeParse(json)
  if (!parsed.success) return NextResponse.json({ ok: false, error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })

  const user = await db.user.findUnique({ where: { email: parsed.data.email.toLowerCase().trim() }, select: { id: true, password: true } })
  if (!user || !verifyPassword(parsed.data.password, user.password)) {
    return NextResponse.json({ ok: false, error: 'Email/password galat hai.' }, { status: 401 })
  }

  await createSession(user.id)
  await logActivity({ userId: user.id, action: 'LOGIN', entity: 'AuthSession' })
  return NextResponse.json({ ok: true })
  } catch (error) {
    return dbErrorResponse(error)
  }
}
