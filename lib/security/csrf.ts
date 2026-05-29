import { NextRequest, NextResponse } from 'next/server'

function hostFrom(value?: string | null) {
  if (!value) return null
  try { return new URL(value).host.toLowerCase() } catch { return null }
}

export function verifySameOrigin(req: NextRequest) {
  const method = req.method.toUpperCase()
  if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') return { ok: true }

  const origin = req.headers.get('origin')
  if (!origin) return { ok: true, skipped: true }

  const originHost = hostFrom(origin)
  const requestHost = req.headers.get('host')?.toLowerCase() || hostFrom(req.url)
  const appHost = hostFrom(process.env.NEXT_PUBLIC_APP_URL)
  const allowed = new Set([requestHost, appHost].filter(Boolean))

  return { ok: Boolean(originHost && allowed.has(originHost)), originHost, allowed: Array.from(allowed) }
}

export function csrfGuard(req: NextRequest) {
  const result = verifySameOrigin(req)
  if (result.ok) return null
  return NextResponse.json({ ok: false, error: 'Security check failed. Refresh the page and try again.' }, { status: 403 })
}
