import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth/session'
import { getClientIp, rateLimitAsync } from '@/lib/rate-limit'
import { normalizeClientErrorPayload, sendErrorAlert, shouldCreateIncident } from '@/lib/monitoring/error-events'

export async function POST(req: NextRequest) {
  const ip = getClientIp(req.headers)
  const limit = await rateLimitAsync(`client-error:${ip}`, 30, 60_000)
  if (!limit.ok) return NextResponse.json({ ok: false, error: 'rate_limited' }, { status: 429 })

  const body = await req.json().catch(() => ({}))
  const event = normalizeClientErrorPayload(body, req.headers)
  const monitoringEnabled = process.env.ERROR_MONITORING_ENABLED !== 'false'

  if (process.env.CLIENT_ERROR_LOG_DRY_RUN === 'true' || !monitoringEnabled) {
    return NextResponse.json({ ok: true, dryRun: true, fingerprint: event.fingerprint, level: event.level })
  }

  const user = await getCurrentUser().catch(() => null)

  await db.userActivity.create({
    data: {
      userId: user?.id || null,
      action: 'CLIENT_ERROR',
      entity: 'MonitoringEvent',
      entityId: event.fingerprint,
      metadata: {
        message: event.message,
        path: event.path,
        url: event.url,
        source: event.source,
        digest: event.digest,
        stack: event.stack,
        componentStack: event.componentStack,
        userAgent: event.userAgent,
        release: event.release,
        level: event.level,
        fingerprint: event.fingerprint,
        occurredAt: event.occurredAt
      }
    }
  }).catch(() => undefined)

  if (shouldCreateIncident(event)) {
    await db.incidentReport.create({
      data: {
        title: `Critical client error: ${event.message.slice(0, 120)}`,
        severity: 'HIGH',
        status: 'OPEN',
        impact: `Detected on ${event.path}. Fingerprint: ${event.fingerprint}`,
        rootCause: 'Pending triage from error monitoring center.',
        actionItems: ['Open /admin/error-monitoring', 'Check latest matching activity logs', 'Reproduce on mobile and desktop', 'Patch root cause and close incident']
      }
    }).catch(() => undefined)
  }

  const alert = await sendErrorAlert(event)
  return NextResponse.json({ ok: true, fingerprint: event.fingerprint, level: event.level, alert })
}
