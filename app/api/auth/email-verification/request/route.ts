import { NextRequest, NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { createEmailVerificationToken } from '@/lib/auth/email-verification'
import { sendTransactionalEmail, verificationEmailHtml } from '@/lib/email/service'
import { csrfGuard } from '@/lib/security/csrf'
import { getClientIp, rateLimitAsync } from '@/lib/rate-limit'

export async function POST(req: NextRequest) {
  const csrf = csrfGuard(req)
  if (csrf) return csrf
  const ip = getClientIp(req.headers)
  if (!(await rateLimitAsync(`email-verify-request:${ip}`, 5, 60_000)).ok) {
    return NextResponse.json({ ok: false, error: 'Too many verification email requests. Try again later.' }, { status: 429 })
  }

  const user = await requireUser()
  const fullUser = await db.user.findUnique({ where: { id: user.id }, select: { id: true, name: true, email: true, emailVerifiedAt: true } })
  if (!fullUser) return NextResponse.json({ ok: false, error: 'User not found' }, { status: 404 })
  if (fullUser.emailVerifiedAt) return NextResponse.json({ ok: true, alreadyVerified: true })

  const { token } = await createEmailVerificationToken(fullUser.id)
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(req.url).origin
  const verifyUrl = `${baseUrl}/api/auth/email-verification/confirm?token=${token}`
  const result = await sendTransactionalEmail({
    to: fullUser.email,
    subject: 'Verify your HaqSathi AI email',
    template: 'email-verification',
    userId: fullUser.id,
    html: verificationEmailHtml(fullUser.name, verifyUrl),
    text: `Verify your HaqSathi AI email: ${verifyUrl}`
  })
  const devVerifyUrl = !process.env.RESEND_API_KEY && process.env.EMAIL_VERIFICATION_DEV_LINKS !== 'false' ? verifyUrl : undefined
  return NextResponse.json({ ok: result.ok, skipped: 'skipped' in result ? result.skipped : false, devVerifyUrl })
}
