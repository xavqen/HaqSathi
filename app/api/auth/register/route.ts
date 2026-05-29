import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getClientIp, rateLimitAsync } from '@/lib/rate-limit'
import { csrfGuard } from '@/lib/security/csrf'
import { createEmailVerificationToken } from '@/lib/auth/email-verification'
import { sendTransactionalEmail, verificationEmailHtml } from '@/lib/email/service'
import { registerSchema } from '@/lib/validators/auth'
import { hashPassword } from '@/lib/auth/password'
import { createSession } from '@/lib/auth/session'
import { logActivity } from '@/lib/activity'
import { dbErrorResponse, safeJson } from '@/lib/api/errors'

export async function POST(req: NextRequest) {
  try {
  const csrf = csrfGuard(req)
  if (csrf) return csrf
  const ip = getClientIp(req.headers)
  if (!(await rateLimitAsync(`register:${ip}`, 5, 60_000)).ok) {
    return NextResponse.json({ ok: false, error: 'Too many attempts. Try again after 1 minute.' }, { status: 429 })
  }

  const json = await safeJson(req)
  const parsed = registerSchema.safeParse(json)
  if (!parsed.success) return NextResponse.json({ ok: false, error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })

  const email = parsed.data.email.toLowerCase().trim()
  const existing = await db.user.findUnique({ where: { email }, select: { id: true } })
  if (existing) return NextResponse.json({ ok: false, error: 'Email already registered. Please log in.' }, { status: 409 })

  const user = await db.user.create({ data: { name: parsed.data.name.trim(), email, password: hashPassword(parsed.data.password) }, select: { id: true, name: true, email: true } })
  const { token } = await createEmailVerificationToken(user.id)
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(req.url).origin
  const verifyUrl = `${baseUrl}/api/auth/email-verification/confirm?token=${token}`
  await sendTransactionalEmail({
    to: user.email,
    subject: 'Verify your HaqSathi AI email',
    template: 'email-verification',
    userId: user.id,
    html: verificationEmailHtml(user.name, verifyUrl),
    text: `Verify your HaqSathi AI email: ${verifyUrl}`
  })
  await createSession(user.id)
  await logActivity({ userId: user.id, action: 'REGISTER', entity: 'User', entityId: user.id })
  const devVerifyUrl = !process.env.RESEND_API_KEY && process.env.EMAIL_VERIFICATION_DEV_LINKS !== 'false' ? verifyUrl : undefined
  return NextResponse.json({ ok: true, devVerifyUrl })
  } catch (error) {
    return dbErrorResponse(error)
  }
}
