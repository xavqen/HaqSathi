import { Prisma } from '@prisma/client'
import { NextResponse } from 'next/server'

export function dbErrorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : String(error)
  const isAuth = message.includes('Authentication failed') || message.includes('P1000')
  const isReach = message.includes("Can't reach database") || message.includes('P1001')
  const isPrisma = (error instanceof Error && error.name === 'PrismaClientInitializationError') || isAuth || isReach

  console.error('[api-error]', message)

  if (isPrisma) {
    return NextResponse.json(
      {
        ok: false,
        error: isAuth
          ? 'Database login failed. .env me Supabase DATABASE_URL/DIRECT_URL credentials sahi karo, phir npm run db:doctor chalao.'
          : 'Database connect nahi ho pa raha. npm run db:doctor se check karo.',
        code: isAuth ? 'DB_AUTH_FAILED' : 'DB_CONNECTION_FAILED'
      },
      { status: 503 }
    )
  }

  return NextResponse.json({ ok: false, error: 'Server error. Thodi der baad try karo.', code: 'SERVER_ERROR' }, { status: 500 })
}

export async function safeJson<T>(req: Request): Promise<T | null> {
  return req.json().catch(() => null) as Promise<T | null>
}
