import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { getClientIp, rateLimitAsync } from '@/lib/rate-limit'
import { csrfGuard } from '@/lib/security/csrf'
import { normalizeNewsletterSource } from '@/lib/newsletter/readiness'

const schema = z.object({
  email: z.string().trim().email().max(160),
  consent: z.union([z.boolean(), z.string()]).transform((value) => value === true || value === 'on' || value === 'true'),
  source: z.string().max(80).optional()
})

function isEnabled(value?: string) {
  return /^(true|1|yes|enabled)$/i.test(value || '')
}

export async function POST(req: NextRequest) {
  const csrf = csrfGuard(req)
  if (csrf) return csrf

  const ip = getClientIp(req.headers)
  const limited = await rateLimitAsync(`newsletter:${ip}`, 5, 60_000)
  if (!limited.ok) return NextResponse.json({ ok: false, error: 'Too many newsletter requests. Try again after 1 minute.' }, { status: 429 })

  const json = await req.json().catch(() => null)
  const parsed = schema.safeParse(json)
  if (!parsed.success || !parsed.data.consent) return NextResponse.json({ ok: false, error: 'Valid email and consent are required.' }, { status: 400 })

  const source = normalizeNewsletterSource(parsed.data.source)
  const dryRun = isEnabled(process.env.NEWSLETTER_DRY_RUN) || !process.env.NEWSLETTER_DRY_RUN
  const status = dryRun ? 'OPT_IN_DRY_RUN' : 'QUEUED'

  try {
    await db.emailLog.create({
      data: {
        toEmail: parsed.data.email.toLowerCase(),
        subject: 'HaqSathi AI newsletter opt-in',
        template: `newsletter_opt_in_${source}`,
        provider: process.env.NEWSLETTER_PROVIDER || 'resend',
        status
      }
    })
  } catch (error) {
    console.error('newsletter subscribe log failed', error)
  }

  return NextResponse.json({
    ok: true,
    dryRun,
    message: dryRun ? 'Newsletter opt-in saved in dry-run mode.' : 'Please check your inbox to confirm subscription.'
  })
}
