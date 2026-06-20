import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { getClientIp, rateLimitAsync } from '@/lib/rate-limit'
import { csrfGuard } from '@/lib/security/csrf'
import { createPasswordResetToken } from '@/lib/auth/password-reset'
import { passwordResetEmailHtml, sendTransactionalEmail } from '@/lib/email/service'
import { absoluteUrl } from '@/lib/utils'

const schema = z.object({ email: z.string().email() })

export async function POST(req: NextRequest) {
  const csrf = csrfGuard(req)
  if (csrf) return csrf
  const ip = getClientIp(req.headers)
  if (!(await rateLimitAsync(`forgot:${ip}`, 5, 60_000)).ok) return NextResponse.json({ ok: false, message: 'Too many requests. Try again after 1 minute.' }, { status: 429 })
  const json = await req.json().catch(() => null)
  const parsed = schema.safeParse(json)
  if (!parsed.success) return NextResponse.json({ ok: false, message: 'Valid email required.' }, { status: 400 })

  const user = await db.user.findUnique({ where: { email: parsed.data.email.toLowerCase().trim() }, select: { id: true, email: true, name: true } })
  let devResetUrl: string | undefined
  if (user) {
    const { token } = await createPasswordResetToken(user.id)
    const resetUrl = absoluteUrl(`/reset-password?token=${token}`)
    await sendTransactionalEmail({
      to: user.email,
      subject: 'Reset your HaqSathi AI password',
      template: 'password-reset',
      userId: user.id,
      html: passwordResetEmailHtml(user.name, resetUrl),
      text: `Reset your password: ${resetUrl}`
    })
    const allowLocalDevResetLink = process.env.NODE_ENV !== 'production' && process.env.PASSWORD_RESET_DEV_LINKS === 'true'
    if (!process.env.RESEND_API_KEY && allowLocalDevResetLink) devResetUrl = resetUrl
  }

  return NextResponse.json({ ok: true, message: 'If the email is registered, reset instructions will be sent.', devResetUrl })
}
