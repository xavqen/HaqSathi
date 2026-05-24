import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { rateLimit } from '@/lib/rate-limit'
import { registerSchema } from '@/lib/validators/auth'
import { hashPassword } from '@/lib/auth/password'
import { createSession } from '@/lib/auth/session'
import { logActivity } from '@/lib/activity'
import { dbErrorResponse, safeJson } from '@/lib/api/errors'

export async function POST(req: NextRequest) {
  try {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local'
  if (!rateLimit(`register:${ip}`, 5, 60_000).ok) {
    return NextResponse.json({ ok: false, error: 'Too many attempts. 1 minute baad try karo.' }, { status: 429 })
  }

  const json = await safeJson(req)
  const parsed = registerSchema.safeParse(json)
  if (!parsed.success) return NextResponse.json({ ok: false, error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })

  const email = parsed.data.email.toLowerCase().trim()
  const existing = await db.user.findUnique({ where: { email }, select: { id: true } })
  if (existing) return NextResponse.json({ ok: false, error: 'Email already registered. Login karo.' }, { status: 409 })

  const user = await db.user.create({ data: { name: parsed.data.name.trim(), email, password: hashPassword(parsed.data.password) }, select: { id: true } })
  await createSession(user.id)
  await logActivity({ userId: user.id, action: 'REGISTER', entity: 'User', entityId: user.id })
  return NextResponse.json({ ok: true })
  } catch (error) {
    return dbErrorResponse(error)
  }
}
