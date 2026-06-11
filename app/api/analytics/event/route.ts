import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/session'
import { csrfGuard } from '@/lib/security/csrf'
import { getClientIp, rateLimitAsync } from '@/lib/rate-limit'
import { logActivity } from '@/lib/activity'
import { isAllowedAnalyticsEvent, redactAnalyticsValue } from '@/lib/analytics/growth-readiness'

const enabled = () => process.env.ANALYTICS_EVENT_API_ENABLED === 'true' || process.env.NEXT_PUBLIC_FIRST_PARTY_ANALYTICS === 'true'

export async function POST(req: NextRequest) {
  const csrf = csrfGuard(req)
  if (csrf) return csrf

  if (!enabled()) return NextResponse.json({ ok: true, skipped: true })

  const ip = getClientIp(req.headers)
  const limited = await rateLimitAsync(`analytics:${ip}`, 60, 60_000)
  if (!limited.ok) return NextResponse.json({ ok: false, error: 'Too many analytics events' }, { status: 429 })

  const json = await req.json().catch(() => null) as { event?: string; path?: string; [key: string]: unknown } | null
  const event = typeof json?.event === 'string' ? json.event : ''
  if (!isAllowedAnalyticsEvent(event)) return NextResponse.json({ ok: false, error: 'Unsupported analytics event' }, { status: 400 })

  const sampleRate = Number(process.env.ANALYTICS_SAMPLE_RATE || '1')
  if (Number.isFinite(sampleRate) && sampleRate > 0 && sampleRate < 1 && Math.random() > sampleRate) {
    return NextResponse.json({ ok: true, sampled: false })
  }

  const user = await getCurrentUser().catch(() => null)
  const path = typeof json?.path === 'string' ? json.path.split('#')[0].slice(0, 220) : ''
  const metadata = redactAnalyticsValue({
    event,
    path,
    referrer: json?.referrer,
    viewport: json?.viewport,
    language: json?.language,
    source: json?.source,
    receivedAt: new Date().toISOString()
  })

  await logActivity({
    userId: user?.id,
    action: `ANALYTICS_${event.toUpperCase()}`,
    entity: 'AnalyticsEvent',
    entityId: path || undefined,
    metadata
  })

  return NextResponse.json({ ok: true })
}
