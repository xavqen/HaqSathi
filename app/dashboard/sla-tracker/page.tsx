import { requireUser } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { SlaTrackForm } from '@/components/forms/sla-track-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const dynamic = 'force-dynamic'
export default async function DashboardSlaTrackerPage() {
  const user = await requireUser()
  const [tracks, complaints] = await Promise.all([
    db.caseSlaTrack.findMany({ where: { userId: user.id }, orderBy: { targetDate: 'asc' }, include: { complaint: { select: { companyName: true, type: true } } } }).catch(() => []),
    db.complaint.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' }, select: { id: true, companyName: true, type: true } }).catch(() => [])
  ])
  return (
    <div className="grid gap-6">
      <div><h1 className="text-3xl font-black tracking-tight">SLA tracker</h1><p className="mt-2 text-slate-600">Follow-up deadline miss na ho. Har case ka next action yahan save karo.</p></div>
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]"><SlaTrackForm complaints={complaints} />
        <div className="grid gap-4">{tracks.map((track) => <Card key={track.id}><CardHeader><div className="flex items-center justify-between gap-3"><CardTitle>{track.title}</CardTitle><Badge>{track.status.replace('_', ' ')}</Badge></div></CardHeader><CardContent><p className="text-sm text-slate-600"><b>Stage:</b> {track.stage}</p><p className="mt-1 text-sm text-slate-600"><b>Target:</b> {track.targetDate.toDateString()}</p><p className="mt-3 rounded-xl bg-slate-50 p-3 text-sm">{track.nextAction}</p>{track.riskNote && <p className="mt-2 text-sm text-amber-700">Risk: {track.riskNote}</p>}</CardContent></Card>)}{tracks.length === 0 && <p className="rounded-2xl border bg-white p-5 text-sm text-slate-600">Abhi SLA tracker empty hai.</p>}</div>
      </div>
    </div>
  )
}
