export type ErrorLevel = 'info' | 'warning' | 'error' | 'critical'

export type ClientErrorPayload = {
  message?: unknown
  path?: unknown
  url?: unknown
  source?: unknown
  digest?: unknown
  stack?: unknown
  componentStack?: unknown
  userAgent?: unknown
  release?: unknown
  level?: unknown
  eventId?: unknown
}

export type NormalizedErrorEvent = {
  message: string
  path: string
  url: string
  source: string
  digest?: string
  stack?: string
  componentStack?: string
  userAgent?: string
  release: string
  level: ErrorLevel
  fingerprint: string
  occurredAt: string
}

const SECRET_PATTERNS: RegExp[] = [
  /sk-[a-z0-9_-]{12,}/gi,
  /rk_live_[a-z0-9_-]{8,}/gi,
  /rzp_(live|test)_[a-z0-9]+/gi,
  /eyJ[a-zA-Z0-9_-]{20,}\.[a-zA-Z0-9_-]{20,}\.[a-zA-Z0-9_-]{10,}/g,
  /Bearer\s+[a-z0-9._-]{12,}/gi,
  /password\s*[:=]\s*[^\s,;]+/gi,
  /token\s*[:=]\s*[^\s,;]+/gi,
  /secret\s*[:=]\s*[^\s,;]+/gi
]

function toText(value: unknown, fallback = '') {
  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  if (value == null) return fallback
  try { return JSON.stringify(value) } catch { return fallback }
}

export function maskSensitiveText(input: unknown, maxLength = 1200) {
  let output = toText(input)
  for (const pattern of SECRET_PATTERNS) output = output.replace(pattern, '[redacted]')
  return output.replace(/[\u0000-\u001f\u007f]/g, ' ').slice(0, maxLength)
}

export function normalizeErrorLevel(value: unknown, message: string): ErrorLevel {
  const raw = toText(value).toLowerCase()
  if (raw === 'critical' || /chunkloaderror|hydration failed|database|prisma|payment|webhook/i.test(message)) return 'critical'
  if (raw === 'error' || /error|exception|failed|rejected|unhandled/i.test(message)) return 'error'
  if (raw === 'warning' || raw === 'warn') return 'warning'
  return 'info'
}

function hash(input: string) {
  let value = 2166136261
  for (let index = 0; index < input.length; index += 1) {
    value ^= input.charCodeAt(index)
    value = Math.imul(value, 16777619)
  }
  return (value >>> 0).toString(16).padStart(8, '0')
}

export function buildErrorFingerprint(event: Pick<NormalizedErrorEvent, 'message' | 'path' | 'source' | 'digest'>) {
  const normalizedMessage = event.message.replace(/\d+/g, '#').replace(/https?:\/\/\S+/g, '[url]').slice(0, 180)
  return hash([event.source, event.path, normalizedMessage, event.digest || ''].join('|'))
}

export function normalizeClientErrorPayload(payload: ClientErrorPayload, requestHeaders?: Headers): NormalizedErrorEvent {
  const message = maskSensitiveText(payload.message || 'Unknown client error', 700)
  const path = maskSensitiveText(payload.path || '/', 260)
  const source = maskSensitiveText(payload.source || 'browser', 80)
  const digest = payload.digest ? maskSensitiveText(payload.digest, 120) : undefined
  const event: NormalizedErrorEvent = {
    message,
    path,
    url: maskSensitiveText(payload.url || '', 320),
    source,
    digest,
    stack: payload.stack ? maskSensitiveText(payload.stack, 1200) : undefined,
    componentStack: payload.componentStack ? maskSensitiveText(payload.componentStack, 1200) : undefined,
    userAgent: maskSensitiveText(payload.userAgent || requestHeaders?.get('user-agent') || '', 260),
    release: maskSensitiveText(payload.release || process.env.NEXT_PUBLIC_APP_VERSION || 'local', 80),
    level: normalizeErrorLevel(payload.level, message),
    fingerprint: '',
    occurredAt: new Date().toISOString()
  }
  event.fingerprint = buildErrorFingerprint(event)
  return event
}

export function shouldCreateIncident(event: NormalizedErrorEvent) {
  if (process.env.ERROR_AUTO_INCIDENTS !== 'true') return false
  return event.level === 'critical'
}

export function shouldSendAlert(event: NormalizedErrorEvent) {
  if (!process.env.ERROR_ALERT_WEBHOOK_URL) return false
  const order: ErrorLevel[] = ['info', 'warning', 'error', 'critical']
  const min = (process.env.ERROR_ALERT_MIN_LEVEL || 'error') as ErrorLevel
  return order.indexOf(event.level) >= Math.max(0, order.indexOf(min))
}

export async function sendErrorAlert(event: NormalizedErrorEvent) {
  if (!shouldSendAlert(event)) return { sent: false, reason: 'not-configured-or-below-threshold' }
  try {
    const response = await fetch(process.env.ERROR_ALERT_WEBHOOK_URL as string, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: `HaqSathi ${event.level.toUpperCase()} error on ${event.path}: ${event.message}`,
        event
      })
    })
    return { sent: response.ok, status: response.status }
  } catch (error) {
    return { sent: false, reason: error instanceof Error ? error.message : 'webhook failed' }
  }
}
