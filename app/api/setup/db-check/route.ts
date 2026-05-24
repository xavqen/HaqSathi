import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

function redact(raw?: string) {
  if (!raw) return null
  return raw.replace(/:\/\/([^:]+):([^@]+)@/, (_m, user) => `://${user}:***@`)
}

export async function GET() {
  try {
    await db.$queryRaw`SELECT 1`
    return NextResponse.json({ ok: true, message: 'Database connection OK', databaseUrl: redact(process.env.DATABASE_URL) })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    const isAuth = message.includes('Authentication failed') || message.includes('P1000')
    return NextResponse.json({
      ok: false,
      code: isAuth ? 'DB_AUTH_FAILED' : 'DB_CONNECTION_FAILED',
      message: isAuth
        ? 'Database username/password galat hai. Supabase se fresh connection string paste karo.'
        : 'Database connect nahi ho pa raha. URL, network, pooler aur project status check karo.',
      databaseUrl: redact(process.env.DATABASE_URL),
      hint: 'Terminal me npm run db:doctor chalao.'
    }, { status: 503 })
  }
}
