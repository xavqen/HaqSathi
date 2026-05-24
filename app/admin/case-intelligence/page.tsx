import { requireAdmin } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Case Intelligence | HaqSathi Admin' }

export default async function Page() {
  await requireAdmin()
  const [events, plans, reports] = await Promise.all([
    db.caseTimelineEvent.findMany({ orderBy: { createdAt: 'desc' }, take: 20, include: { user: { select: { email: true } }, complaint: { select: { companyName: true, type: true } } } }).catch(() => []),
    db.escalationPlan.count().catch(() => 0),
    db.riskAssessment.count().catch(() => 0)
  ])
  return <div><h1 className="text-3xl font-black">Case Intelligence</h1><p className="mt-2 text-slate-600">Timeline, escalation aur risk signals.</p><div className="mt-6 grid gap-4 md:grid-cols-2"><Card><CardHeader><CardTitle>Escalation plans</CardTitle></CardHeader><CardContent><p className="text-3xl font-black">{plans}</p></CardContent></Card><Card><CardHeader><CardTitle>Risk reports</CardTitle></CardHeader><CardContent><p className="text-3xl font-black">{reports}</p></CardContent></Card></div><Card className="mt-6"><CardHeader><CardTitle>Recent timeline events</CardTitle></CardHeader><CardContent className="grid gap-2">{events.length ? events.map((e) => <div key={e.id} className="rounded-xl border p-3 text-sm"><b>{e.title}</b><p className="text-slate-600">{e.complaint?.companyName} · {e.complaint?.type} · {e.user?.email || 'guest'}</p></div>) : <p>No timeline yet.</p>}</CardContent></Card></div>
}
