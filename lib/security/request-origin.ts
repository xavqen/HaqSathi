import type { NextRequest } from 'next/server'
import { getSiteUrl } from '@/lib/utils'

export type RequestOriginDecision = {
  ok: boolean
  reason?: 'safe-method' | 'non-api-route' | 'allowlisted-route' | 'same-origin' | 'same-site' | 'server-to-server' | 'cross-site' | 'origin-mismatch'
  originHost?: string | null
  requestHost?: string | null
  allowedHosts?: string[]
}

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS'])
const MUTATION_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])

const API_ORIGIN_BYPASS_PREFIXES = [
  '/api/billing/webhook',
  '/api/cron/',
  '/api/health',
  '/api/ready',
  '/api/system/heartbeat'
]

function hostFrom(value?: string | null) {
  if (!value) return null
  try {
    return new URL(value).host.toLowerCase()
  } catch {
    return null
  }
}

function normalizedHost(value?: string | null) {
  if (!value) return null
  return value.toLowerCase().trim().replace(/^https?:\/\//, '').replace(/\/+$/, '') || null
}

function configuredHostFromEnv(name: string) {
  const value = process.env[name]
  if (!value) return null
  return hostFrom(/^https?:\/\//i.test(value) ? value : `https://${value}`)
}

export function getAllowedMutationHosts(req: NextRequest) {
  const requestHost = normalizedHost(req.headers.get('host')) || hostFrom(req.url)
  const appHost = hostFrom(getSiteUrl())
  const envHosts = [
    configuredHostFromEnv('NEXT_PUBLIC_APP_URL'),
    configuredHostFromEnv('VERCEL_PROJECT_PRODUCTION_URL'),
    configuredHostFromEnv('VERCEL_URL')
  ]
  return Array.from(new Set([requestHost, appHost, ...envHosts].filter(Boolean) as string[]))
}

export function isApiOriginBypassed(pathname: string) {
  return API_ORIGIN_BYPASS_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(prefix))
}

export function checkMutatingApiRequestOrigin(req: NextRequest): RequestOriginDecision {
  const method = req.method.toUpperCase()
  const pathname = req.nextUrl?.pathname || new URL(req.url).pathname

  if (SAFE_METHODS.has(method)) return { ok: true, reason: 'safe-method' }
  if (!MUTATION_METHODS.has(method)) return { ok: false, reason: 'cross-site' }
  if (!pathname.startsWith('/api/')) return { ok: true, reason: 'non-api-route' }
  if (isApiOriginBypassed(pathname)) return { ok: true, reason: 'allowlisted-route' }

  const allowedHosts = getAllowedMutationHosts(req)
  const requestHost = normalizedHost(req.headers.get('host')) || hostFrom(req.url)
  const originHost = hostFrom(req.headers.get('origin'))
  const fetchSite = req.headers.get('sec-fetch-site')?.toLowerCase() || ''

  if (originHost) {
    const originAllowed = allowedHosts.includes(originHost)
    return {
      ok: originAllowed,
      reason: originAllowed ? 'same-origin' : 'origin-mismatch',
      originHost,
      requestHost,
      allowedHosts
    }
  }

  if (fetchSite === 'cross-site') {
    return { ok: false, reason: 'cross-site', originHost, requestHost, allowedHosts }
  }

  if (fetchSite === 'same-origin' || fetchSite === 'same-site') {
    return { ok: true, reason: fetchSite === 'same-origin' ? 'same-origin' : 'same-site', originHost, requestHost, allowedHosts }
  }

  // Native apps, webhook providers and server-to-server jobs often do not send browser Origin/Sec-Fetch headers.
  return { ok: true, reason: 'server-to-server', originHost, requestHost, allowedHosts }
}
