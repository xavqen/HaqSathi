import { randomBytes } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { safeRedirectPath } from '@/lib/security/redirect'
import { getSiteUrl } from '@/lib/utils'

export const GOOGLE_OAUTH_STATE_COOKIE = 'haqsathi_google_oauth_state'
export const GOOGLE_OAUTH_NEXT_COOKIE = 'haqsathi_google_oauth_next'

export type GoogleProfile = {
  sub: string
  email: string
  email_verified?: boolean
  name?: string
  picture?: string
}

function appUrl(req?: NextRequest) {
  if (process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL) return getSiteUrl()
  if (req) return req.nextUrl.origin
  return getSiteUrl()
}

export function getGoogleRedirectUri(req?: NextRequest) {
  return process.env.GOOGLE_AUTH_REDIRECT_URI || `${appUrl(req)}/api/auth/google/callback`
}

export function hasGoogleOAuthConfig() {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET)
}

export const safeNextPath = safeRedirectPath


export function buildGoogleAuthRedirect(req: NextRequest) {
  if (!hasGoogleOAuthConfig()) {
    return NextResponse.redirect(new URL('/login?error=google_not_configured', req.url))
  }

  const state = randomBytes(24).toString('hex')
  const next = safeNextPath(req.nextUrl.searchParams.get('next'))
  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')
  authUrl.searchParams.set('client_id', process.env.GOOGLE_CLIENT_ID!)
  authUrl.searchParams.set('redirect_uri', getGoogleRedirectUri(req))
  authUrl.searchParams.set('response_type', 'code')
  authUrl.searchParams.set('scope', 'openid email profile')
  authUrl.searchParams.set('state', state)
  authUrl.searchParams.set('prompt', 'select_account')
  authUrl.searchParams.set('access_type', 'offline')

  const res = NextResponse.redirect(authUrl)
  const secure = process.env.NODE_ENV === 'production'
  res.cookies.set(GOOGLE_OAUTH_STATE_COOKIE, state, { httpOnly: true, sameSite: 'lax', secure, path: '/api/auth/google', maxAge: 10 * 60 })
  res.cookies.set(GOOGLE_OAUTH_NEXT_COOKIE, next, { httpOnly: true, sameSite: 'lax', secure, path: '/api/auth/google', maxAge: 10 * 60 })
  return res
}

export async function exchangeGoogleCodeForProfile(code: string, req: NextRequest): Promise<GoogleProfile> {
  if (!hasGoogleOAuthConfig()) throw new Error('Google OAuth env missing')

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: getGoogleRedirectUri(req),
      grant_type: 'authorization_code'
    })
  })

  const tokenJson = await tokenRes.json().catch(() => null) as { access_token?: string; error?: string; error_description?: string } | null
  if (!tokenRes.ok || !tokenJson?.access_token) {
    throw new Error(tokenJson?.error_description || tokenJson?.error || 'Google token exchange failed')
  }

  const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${tokenJson.access_token}` }
  })
  const profile = await userRes.json().catch(() => null) as GoogleProfile | null
  if (!userRes.ok || !profile?.sub || !profile.email) throw new Error('Google profile fetch failed')
  return profile
}
