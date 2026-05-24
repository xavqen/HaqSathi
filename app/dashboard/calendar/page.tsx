import Link from 'next/link'
import { db } from '@/lib/db'
import { requireUser } from '@/lib/auth/session'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const dynamic = 'force-dynamic'
export default async function CalendarPage() {
  const user = await requireUser()
  const reminders = await db.reminder.findMany({ where: { userId: user.id }, orderBy: { dueDate: 'asc' }, take: 50 }).catch(() => [])
  return <div><div className="flex flex-wrap items-start justify-between gap-4"><div><h1 className="text-4xl font-black">Reminder Calendar</h1><p className="mt-2 text-slate-600">Pending reminders ko phone/Google Calendar me import karne ke liye ICS export.</p></div><Link href="/api/reminders/calendar" className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground">Download .ics</Link></div><Card className="mt-8"><CardHeader><CardTitle>Upcoming reminders</CardTitle></CardHeader><CardContent>{reminders.length === 0 ? <p className="text-slate-500">No reminders.</p> : <div className="space-y-3">{reminders.map((reminder) => <div key={reminder.id} className="rounded-xl border p-4"><b>{reminder.title}</b><p className="text-sm text-slate-600">{reminder.status} · {reminder.dueDate.toDateString()}</p></div>)}</div>}</CardContent></Card></div>
}
