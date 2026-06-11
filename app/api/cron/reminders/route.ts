import { NextRequest, NextResponse } from 'next/server'
import { queueDueReminderNotifications } from '@/lib/reminders/queue'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

function isAuthorized(req: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (!secret) return process.env.NODE_ENV !== 'production'
  const auth = req.headers.get('authorization') || ''
  const querySecret = req.nextUrl.searchParams.get('secret') || ''
  return auth === `Bearer ${secret}` || querySecret === secret
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized cron' }, { status: 401 })
  }

  const result = await queueDueReminderNotifications(1)
  return NextResponse.json(
    { ok: true, result, checkedAt: new Date().toISOString() },
    { headers: { 'Cache-Control': 'no-store', 'X-HaqSathi-Cron': 'reminders' } }
  )
}
