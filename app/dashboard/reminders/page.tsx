import { db } from '@/lib/db'
import { requireUser } from '@/lib/auth/session'
import { ReminderForm } from '@/components/forms/reminder-form'
import { ReminderActions } from '@/components/dashboard/reminder-actions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const dynamic = 'force-dynamic'
export default async function Page() {
  const user = await requireUser()
  const reminders = await db.reminder.findMany({ where: { userId: user.id }, orderBy: { dueDate: 'asc' }, take: 50 })
  return <div><h1 className="text-3xl font-black">Reminders</h1><p className="mt-2 text-slate-600">Follow-up dates track karo; done/cancel/delete actions added.</p><div className="mt-6"><ReminderForm /></div><Card className="mt-6"><CardHeader><CardTitle>Upcoming</CardTitle></CardHeader><CardContent className="space-y-3">{reminders.length ? reminders.map(r => <div key={r.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4"><div><b>{r.title}</b><p className="text-sm text-slate-600">Due: {r.dueDate.toDateString()} · {r.status}</p></div><ReminderActions id={r.id} /></div>) : <p className="text-slate-500">No reminders yet.</p>}</CardContent></Card></div>
}
