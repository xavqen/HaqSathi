import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth/session'

export const dynamic = 'force-dynamic'

function noStoreJson(body: unknown, init?: ResponseInit) {
  return NextResponse.json(body, {
    ...init,
    headers: {
      'Cache-Control': 'no-store, max-age=0',
      ...(init?.headers || {})
    }
  })
}

async function canRunSetupCheck(req: NextRequest) {
  const user = await getCurrentUser()
  if (user?.role === 'ADMIN') return true

  const setupSecret = process.env.SETUP_DB_CHECK_SECRET?.trim()
  if (!setupSecret) return process.env.NODE_ENV !== 'production'

  const provided = req.headers.get('x-setup-secret') || req.nextUrl.searchParams.get('secret')
  return provided === setupSecret
}

export async function GET(req: NextRequest) {
  if (!(await canRunSetupCheck(req))) {
    return noStoreJson({ ok: false, error: 'Setup database check is restricted.' }, { status: 404 })
  }

  try {
    await db.$queryRaw`SELECT 1`
    return noStoreJson({ ok: true, message: 'Database connection OK. Use /api/ready for production readiness.' })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    const isAuth = message.includes('Authentication failed') || message.includes('P1000')
    return noStoreJson({
      ok: false,
      code: isAuth ? 'DB_AUTH_FAILED' : 'DB_CONNECTION_FAILED',
      message: isAuth
        ? 'Database credentials failed. Paste a fresh Supabase connection string and redeploy.'
        : 'Database connection failed. Check URL, network, pooler and project status.',
      hint: 'Run npm run db:doctor locally, then check /api/ready after deploy.'
    }, { status: 503 })
  }
}
