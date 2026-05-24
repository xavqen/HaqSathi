import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { createSession } from '@/lib/auth/session'
import { logActivity } from '@/lib/activity'
import { exchangeGoogleCodeForProfile, GOOGLE_OAUTH_NEXT_COOKIE, GOOGLE_OAUTH_STATE_COOKIE, safeNextPath } from '@/lib/auth/google'

export async function GET(req: NextRequest) {
  const fail = (reason: string) => NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(reason)}`, req.url))

  try {
    const code = req.nextUrl.searchParams.get('code')
    const state = req.nextUrl.searchParams.get('state')
    const storedState = req.cookies.get(GOOGLE_OAUTH_STATE_COOKIE)?.value
    const next = safeNextPath(req.cookies.get(GOOGLE_OAUTH_NEXT_COOKIE)?.value)

    if (!code) return fail('google_code_missing')
    if (!state || !storedState || state !== storedState) return fail('google_state_invalid')

    const profile = await exchangeGoogleCodeForProfile(code, req)
    const email = profile.email.toLowerCase().trim()

    const existing = await db.user.findFirst({
      where: { OR: [{ googleId: profile.sub }, { email }] },
      select: { id: true, authProvider: true }
    })

    const user = existing
      ? await db.user.update({
          where: { id: existing.id },
          data: {
            googleId: profile.sub,
            authProvider: existing.authProvider?.includes('google') ? existing.authProvider : `${existing.authProvider || 'email'}+google`,
            name: profile.name || undefined,
            avatarUrl: profile.picture || undefined,
            emailVerifiedAt: profile.email_verified ? new Date() : undefined
          },
          select: { id: true }
        })
      : await db.user.create({
          data: {
            name: profile.name || email.split('@')[0],
            email,
            password: null,
            authProvider: 'google',
            googleId: profile.sub,
            avatarUrl: profile.picture || null,
            emailVerifiedAt: profile.email_verified ? new Date() : null
          },
          select: { id: true }
        })

    await createSession(user.id)
    await logActivity({ userId: user.id, action: existing ? 'GOOGLE_LOGIN' : 'GOOGLE_REGISTER', entity: 'AuthSession' })

    const res = NextResponse.redirect(new URL(next, req.url))
    res.cookies.set(GOOGLE_OAUTH_STATE_COOKIE, '', { path: '/api/auth/google', expires: new Date(0) })
    res.cookies.set(GOOGLE_OAUTH_NEXT_COOKIE, '', { path: '/api/auth/google', expires: new Date(0) })
    return res
  } catch (error) {
    console.error('Google OAuth callback failed', error)
    return fail('google_login_failed')
  }
}
