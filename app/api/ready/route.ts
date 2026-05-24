import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  const checks: Record<string, boolean> = {
    appUrl: Boolean(process.env.NEXT_PUBLIC_APP_URL),
    authSecret: Boolean(process.env.AUTH_SECRET),
    databaseUrl: Boolean(process.env.DATABASE_URL),
    directUrl: Boolean(process.env.DIRECT_URL)
  }

  try {
    await db.$queryRaw`SELECT 1`
    checks.database = true
  } catch {
    checks.database = false
  }

  const ok = Object.values(checks).every(Boolean)
  return NextResponse.json({ ok, checks, time: new Date().toISOString() }, { status: ok ? 200 : 503 })
}
