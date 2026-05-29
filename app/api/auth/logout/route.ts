import { NextRequest, NextResponse } from 'next/server'
import { destroySession } from '@/lib/auth/session'
import { csrfGuard } from '@/lib/security/csrf'

export async function POST(req: NextRequest) {
  const csrf = csrfGuard(req)
  if (csrf) return csrf
  await destroySession()
  return NextResponse.json({ ok: true })
}
