import { db } from '@/lib/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const dynamic = 'force-dynamic'

export default async function Page() {
  const [total, high, avgRows, recent] = await Promise.all([
    db.smartComplaintPlan.count().catch(() => 0),
    db.smartComplaintPlan.count({ where: { readinessScore: { gte: 80 } } }).catch(() => 0),
    db.smartComplaintPlan.findMany({ select: { readinessScore: true } }).catch(() => []),
    db.smartComplaintPlan.findMany({ orderBy: { createdAt: 'desc' }, take: 10, select: { id: true, issueType: true, readinessScore: true, urgency: true, createdAt: true } }).catch(() => [])
  ])
  const avg = avgRows.length ? Math.round(avgRows.reduce((sum, row) => sum + row.readinessScore, 0) / avgRows.length) : 0
  return (
    <div>
      <h1 className="text-3xl font-black">Smart Wizard Insights</h1>
      <p className="mt-2 text-slate-600">User complaint readiness, issue type demand and high intent workflow analytics.</p>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <Metric title="Total smart packs" value={total} />
        <Metric title="Launch-ready packs" value={high} />
        <Metric title="Average readiness" value={`${avg}/100`} />
      </div>
      <Card className="mt-6 rounded-3xl"><CardHeader><CardTitle>Recent smart packs</CardTitle></CardHeader><CardContent><div className="space-y-3">{recent.map((item) => <div key={item.id} className="rounded-2xl border p-4"><b>{item.issueType.replaceAll('_', ' ')}</b><p className="text-sm text-slate-600">Score {item.readinessScore}/100 · {item.urgency} · {item.createdAt.toDateString()}</p></div>)}</div></CardContent></Card>
    </div>
  )
}

function Metric({ title, value }: { title: string; value: number | string }) {
  return <Card className="rounded-3xl"><CardHeader><CardTitle className="text-base">{title}</CardTitle></CardHeader><CardContent><div className="text-4xl font-black">{value}</div></CardContent></Card>
}
