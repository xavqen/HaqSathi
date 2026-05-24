import { NextResponse } from 'next/server'
import { queueDueReminderNotifications } from '@/lib/reminders/queue'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET
  if (secret) {
    const auth = req.headers.get('authorization')
    if (auth !== `Bearer ${secret}`) return NextResponse.json({ ok: false, error: 'Unauthorized cron' }, { status: 401 })
  }

  const result = await queueDueReminderNotifications(1)
  return NextResponse.json({ ok: true, result })
}
