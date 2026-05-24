import Link from 'next/link'
import { requireUser } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const dynamic = 'force-dynamic'
export default async function CaseHealthPage() {
  const user = await requireUser()
  const [complaints, tasks, reminders, tracks] = await Promise.all([
    db.complaint.count({ where: { userId: user.id } }).catch(() => 0),
    db.caseTask.count({ where: { userId: user.id, status: { in: ['TODO', 'IN_PROGRESS', 'BLOCKED'] } } }).catch(() => 0),
    db.reminder.count({ where: { userId: user.id, status: 'PENDING', dueDate: { lt: new Date() } } }).catch(() => 0),
    db.caseSlaTrack.count({ where: { userId: user.id, status: { in: ['AT_RISK', 'MISSED'] } } }).catch(() => 0)
  ])
  const score = Math.max(0, Math.min(100, 85 - tasks * 4 - reminders * 10 - tracks * 12 + Math.min(complaints, 5) * 2))
  const status = score >= 75 ? 'Healthy' : score >= 50 ? 'Needs attention' : 'High risk'
  return (
    <div className="grid gap-6">
      <div><h1 className="text-3xl font-black tracking-tight">Case health score</h1><p className="mt-2 text-slate-600">Aapke saved work ke basis par simple operational score. Ye legal result guarantee nahi karta.</p></div>
      <Card><CardHeader><CardTitle>Overall status: {status}</CardTitle></CardHeader><CardContent><div className="h-4 overflow-hidden rounded-full bg-slate-200"><div className="h-full bg-primary" style={{ width: `${score}%` }} /></div><p className="mt-4 text-5xl font-black">{score}/100</p></CardContent></Card>
      <div className="grid gap-4 md:grid-cols-4"><Card><CardHeader><CardTitle>Complaints</CardTitle></CardHeader><CardContent><p className="text-3xl font-black">{complaints}</p></CardContent></Card><Card><CardHeader><CardTitle>Open tasks</CardTitle></CardHeader><CardContent><p className="text-3xl font-black">{tasks}</p></CardContent></Card><Card><CardHeader><CardTitle>Overdue reminders</CardTitle></CardHeader><CardContent><p className="text-3xl font-black">{reminders}</p></CardContent></Card><Card><CardHeader><CardTitle>Risky deadlines</CardTitle></CardHeader><CardContent><p className="text-3xl font-black">{tracks}</p></CardContent></Card></div>
      <div className="rounded-3xl border bg-white p-5 shadow-soft"><h2 className="text-xl font-bold">Next best actions</h2><ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-700"><li><Link className="font-semibold text-primary" href="/dashboard/sla-tracker">SLA tracker</Link> me missing deadlines save karo.</li><li><Link className="font-semibold text-primary" href="/dashboard/evidence-packs">Evidence pack</Link> ready rakho.</li><li><Link className="font-semibold text-primary" href="/dashboard/communications">Communication log</Link> me call/email history maintain karo.</li></ul></div>
    </div>
  )
}
