const DEFAULT_AUTH_REDIRECT = '/dashboard'
const MAX_REDIRECT_LENGTH = 180
const BLOCKED_PREFIXES = ['/api', '/_next', '/sw.js', '/offline.html']
const ENCODED_SLASH_OR_BACKSLASH = /%2f|%5c/i
const CONTROL_CHARS = /[\u0000-\u001F\u007F]/

export function safeRedirectPath(next?: string | null, fallback = DEFAULT_AUTH_REDIRECT) {
  const fallbackPath = fallback.startsWith('/') && !fallback.startsWith('//') ? fallback : DEFAULT_AUTH_REDIRECT
  const raw = typeof next === 'string' ? next.trim() : ''

  if (!raw) return fallbackPath
  if (raw.length > MAX_REDIRECT_LENGTH) return fallbackPath
  if (!raw.startsWith('/') || raw.startsWith('//')) return fallbackPath
  if (raw.includes('\\') || CONTROL_CHARS.test(raw)) return fallbackPath
  if (ENCODED_SLASH_OR_BACKSLASH.test(raw.slice(0, 16))) return fallbackPath

  try {
    const parsed = new URL(raw, 'https://haqsathi.local')
    if (parsed.origin !== 'https://haqsathi.local') return fallbackPath
    const path = `${parsed.pathname}${parsed.search}`
    const lowerPath = parsed.pathname.toLowerCase()
    if (BLOCKED_PREFIXES.some((prefix) => lowerPath === prefix || lowerPath.startsWith(`${prefix}/`))) return fallbackPath
    return path || fallbackPath
  } catch {
    return fallbackPath
  }
}

export function buildLoginPath(next?: string | null) {
  const safeNext = safeRedirectPath(next)
  return `/login?next=${encodeURIComponent(safeNext)}`
}
