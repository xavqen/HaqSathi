import { NextRequest, NextResponse } from 'next/server'
import { checkMutatingApiRequestOrigin } from '@/lib/security/request-origin'

export function verifySameOrigin(req: NextRequest) {
  return checkMutatingApiRequestOrigin(req)
}

export function csrfGuard(req: NextRequest) {
  const result = verifySameOrigin(req)
  if (result.ok) return null
  return NextResponse.json({ ok: false, error: 'Security check failed. Refresh the page and try again.' }, { status: 403 })
}
