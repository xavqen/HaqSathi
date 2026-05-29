import { db } from '@/lib/db'

type EmailInput = {
  to: string
  subject: string
  html: string
  text?: string
  template: string
  userId?: string | null
}

export async function sendTransactionalEmail(input: EmailInput) {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.RESEND_FROM_EMAIL || 'HaqSathi AI <noreply@haqsathi.local>'

  if (!apiKey) {
    await db.emailLog.create({ data: { userId: input.userId || null, toEmail: input.to, subject: input.subject, template: input.template, status: 'SKIPPED', error: 'RESEND_API_KEY not configured' } }).catch(() => undefined)
    return { ok: true, skipped: true }
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to: input.to, subject: input.subject, html: input.html, text: input.text })
    })
    const data = await response.json().catch(() => ({}))
    if (!response.ok) throw new Error(data?.message || 'Email provider failed')
    await db.emailLog.create({ data: { userId: input.userId || null, toEmail: input.to, subject: input.subject, template: input.template, status: 'SENT' } }).catch(() => undefined)
    return { ok: true, providerData: data }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Email send failed'
    await db.emailLog.create({ data: { userId: input.userId || null, toEmail: input.to, subject: input.subject, template: input.template, status: 'FAILED', error: message } }).catch(() => undefined)
    return { ok: false, error: message }
  }
}


export function verificationEmailHtml(name: string | null | undefined, verifyUrl: string) {
  const safeName = escapeHtml(name || 'there')
  const safeUrl = escapeHtml(verifyUrl)
  return `<div style="font-family:Arial,sans-serif;line-height:1.6"><h2>HaqSathi AI</h2><p>Hi ${safeName},</p><p>Please verify your email to secure your account and enable production-ready notifications.</p><p><a href="${safeUrl}" style="background:#059669;color:white;padding:12px 18px;border-radius:10px;text-decoration:none;display:inline-block">Verify email</a></p><p>This link is valid for 24 hours. Ignore this email if you did not create this account.</p></div>`
}

export function passwordResetEmailHtml(name: string | null | undefined, resetUrl: string) {
  const safeName = escapeHtml(name || 'there')
  const safeUrl = escapeHtml(resetUrl)
  return `<div style="font-family:Arial,sans-serif;line-height:1.6"><h2>HaqSathi AI</h2><p>Hi ${safeName},</p><p>Click the button below to reset your password. The link is valid for 60 minutes.</p><p><a href="${safeUrl}" style="background:#059669;color:white;padding:12px 18px;border-radius:10px;text-decoration:none;display:inline-block">Reset Password</a></p><p>If you did not request this, ignore this email.</p></div>`
}

export function complaintEmailHtml(name: string, title: string) {
  return `<div style="font-family:Arial,sans-serif;line-height:1.6"><h2>HaqSathi AI</h2><p>Hi ${escapeHtml(name)},</p><p>Your complaint draft <b>${escapeHtml(title)}</b> is saved in your dashboard.</p><p>This is guidance only, not legal advice.</p></div>`
}

function escapeHtml(value: string) {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;')
}
