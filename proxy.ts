import { NextResponse, type NextRequest } from 'next/server'
import { checkMutatingApiRequestOrigin } from '@/lib/security/request-origin'

export function proxy(req: NextRequest) {
  const originCheck = checkMutatingApiRequestOrigin(req)
  if (!originCheck.ok) {
    return NextResponse.json(
      { ok: false, error: 'Security check failed. Refresh the page and try again.' },
      { status: 403, headers: { 'Cache-Control': 'no-store' } }
    )
  }

  const res = NextResponse.next()
  res.headers.set('X-Frame-Options', 'DENY')
  res.headers.set('X-Content-Type-Options', 'nosniff')
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  if (process.env.NODE_ENV === 'production') {
    res.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  }
  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|sw.js|offline.html).*)']
}
