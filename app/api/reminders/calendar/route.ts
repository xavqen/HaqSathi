import { requireUser } from '@/lib/auth/session'
import { db } from '@/lib/db'

function escapeIcs(value: string) {
  return value.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;')
}

function toIcsDate(date: Date) {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z')
}

export async function GET() {
  const user = await requireUser()
  const reminders = await db.reminder.findMany({ where: { userId: user.id, status: 'PENDING' }, orderBy: { dueDate: 'asc' }, take: 200 })
  const now = toIcsDate(new Date())
  const events = reminders.map((r) => [`BEGIN:VEVENT`, `UID:${r.id}@haqsathi-ai`, `DTSTAMP:${now}`, `DTSTART:${toIcsDate(r.dueDate)}`, `SUMMARY:${escapeIcs(r.title)}`, `DESCRIPTION:${escapeIcs('HaqSathi AI reminder. Verify official portal before submitting sensitive data.')}`, `END:VEVENT`].join('\r\n')).join('\r\n')
  const ics = `BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//HaqSathi AI//Reminder Calendar//EN\r\nCALSCALE:GREGORIAN\r\n${events}\r\nEND:VCALENDAR\r\n`
  return new Response(ics, { headers: { 'Content-Type': 'text/calendar; charset=utf-8', 'Content-Disposition': 'attachment; filename="haqsathi-reminders.ics"' } })
}
