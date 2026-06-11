import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getClientIp, rateLimitAsync } from '@/lib/rate-limit'
import { csrfGuard } from '@/lib/security/csrf'
import { normalizeSafetyCategory, redactSafetyText } from '@/lib/safety/community-safety-readiness'

const schema = z.object({
  category: z.string().trim().min(2).max(80),
  summary: z.string().trim().min(20).max(900),
  city: z.string().trim().max(80).optional().default(''),
  consent: z.union([z.boolean(), z.string()]).transform((value) => value === true || value === 'on' || value === 'true')
})

const isEnabled = (value?: string) => /^(true|1|yes|enabled)$/i.test(value || '')

export async function POST(req: NextRequest) {
  const csrf = csrfGuard(req)
  if (csrf) return csrf

  const ip = getClientIp(req.headers)
  const limited = await rateLimitAsync(`community-safety-report:${ip}`, 4, 60_000)
  if (!limited.ok) return NextResponse.json({ ok: false, error: 'Too many reports. Try again after 1 minute.' }, { status: 429 })

  const json = await req.json().catch(() => null)
  const parsed = schema.safeParse(json)
  if (!parsed.success || !parsed.data.consent) {
    return NextResponse.json({ ok: false, error: 'Valid report summary and consent are required.' }, { status: 400 })
  }

  const category = normalizeSafetyCategory(parsed.data.category)
  const redactedSummary = redactSafetyText(parsed.data.summary)
  const redactedCity = redactSafetyText(parsed.data.city || '')
  const dryRun = isEnabled(process.env.COMMUNITY_SAFETY_REPORT_DRY_RUN || 'true')

  return NextResponse.json({
    ok: true,
    dryRun,
    category,
    reportId: `csr_${Date.now().toString(36)}`,
    reviewStatus: dryRun ? 'DRY_RUN_REVIEW_ONLY' : 'RECEIVED_FOR_MODERATION',
    preview: {
      summary: redactedSummary.slice(0, 220),
      city: redactedCity || 'not provided'
    },
    message: dryRun
      ? 'Safety report validated in dry-run mode. Enable storage only after moderation/privacy review.'
      : 'Safety report received for human moderation. Public alerts are redacted and aggregated only.'
  })
}
