import { db } from '@/lib/db'
import { requireUser } from '@/lib/auth/session'
import { CommunicationLogForm } from '@/components/forms/communication-log-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const dynamic = 'force-dynamic'
export default async function Page() {
  const user = await requireUser()
  const [logs, complaints] = await Promise.all([
    db.communicationLog.findMany({ where: { userId: user.id }, include: { complaint: { select: { companyName: true, type: true } } }, orderBy: { createdAt: 'desc' }, take: 100 }),
    db.complaint.findMany({ where: { userId: user.id }, select: { id: true, type: true, companyName: true }, orderBy: { createdAt: 'desc' }, take: 50 })
  ])
  return <div><h1 className="text-3xl font-black">Communication Log</h1><p className="mt-2 text-slate-600">Calls, emails, portal replies aur WhatsApp follow-ups ka complete record rakho.</p><div className="mt-6 grid gap-6 lg:grid-cols-[400px_1fr]"><Card><CardHeader><CardTitle>Add Communication</CardTitle></CardHeader><CardContent><CommunicationLogForm complaints={complaints} /></CardContent></Card><Card><CardHeader><CardTitle>Timeline</CardTitle></CardHeader><CardContent className="space-y-3">{logs.length ? logs.map((log) => <div key={log.id} className="rounded-2xl border p-4"><div className="flex flex-wrap items-center gap-2"><b>{log.subject}</b><Badge>{log.channel}</Badge><Badge>{log.status}</Badge></div><p className="mt-1 text-sm text-slate-600">{log.recipientName}{log.recipientContact ? ` · ${log.recipientContact}` : ''}</p>{log.complaint && <p className="mt-1 text-xs text-slate-500">Linked: {log.complaint.companyName} · {log.complaint.type}</p>}<p className="mt-2 whitespace-pre-wrap text-sm">{log.message}</p>{log.nextFollowUpAt && <p className="mt-2 text-xs font-semibold text-primary">Next follow-up: {log.nextFollowUpAt.toLocaleString('en-IN')}</p>}<p className="mt-2 text-xs text-slate-500">{log.createdAt.toLocaleString('en-IN')}</p></div>) : <p className="text-slate-500">No communication logged yet.</p>}</CardContent></Card></div></div>
}
