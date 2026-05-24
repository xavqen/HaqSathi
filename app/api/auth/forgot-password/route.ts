import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { rateLimit } from '@/lib/rate-limit'
import { createPasswordResetToken } from '@/lib/auth/password-reset'
import { sendTransactionalEmail } from '@/lib/email/service'

const schema = z.object({ email: z.string().email() })

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local'
  if (!rateLimit(`forgot:${ip}`, 5, 60_000).ok) return NextResponse.json({ ok: false, message: 'Too many requests. 1 minute baad try karo.' }, { status: 429 })
  const json = await req.json().catch(() => null)
  const parsed = schema.safeParse(json)
  if (!parsed.success) return NextResponse.json({ ok: false, message: 'Valid email required.' }, { status: 400 })

  const user = await db.user.findUnique({ where: { email: parsed.data.email.toLowerCase().trim() }, select: { id: true, email: true, name: true } })
  let devResetUrl: string | undefined
  if (user) {
    const { token } = await createPasswordResetToken(user.id)
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(req.url).origin
    const resetUrl = `${baseUrl}/reset-password?token=${token}`
    await sendTransactionalEmail({
      to: user.email,
      subject: 'Reset your HaqSathi AI password',
      template: 'password-reset',
      userId: user.id,
      html: `<div style="font-family:Arial,sans-serif;line-height:1.6"><h2>HaqSathi AI</h2><p>Hi ${user.name || 'there'},</p><p>Password reset ke liye niche button click karo. Link 60 minutes ke liye valid hai.</p><p><a href="${resetUrl}" style="background:#059669;color:white;padding:12px 18px;border-radius:10px;text-decoration:none;display:inline-block">Reset Password</a></p><p>Agar aapne request nahi ki, is email ko ignore karo.</p></div>`,
      text: `Reset your password: ${resetUrl}`
    })
    if (!process.env.RESEND_API_KEY && process.env.PASSWORD_RESET_DEV_LINKS !== 'false') devResetUrl = resetUrl
  }

  return NextResponse.json({ ok: true, message: 'Agar email registered hai, reset instructions send ho jayenge.', devResetUrl })
}
