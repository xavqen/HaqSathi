import { requireAdmin } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Growth Dashboard | HaqSathi Admin' }

export default async function Page() {
  await requireAdmin()
  const [users, complaints, templates, feedback, risks] = await Promise.all([
    db.user.count().catch(() => 0),
    db.complaint.count().catch(() => 0),
    db.templateUse.count().catch(() => 0),
    db.feedback.count().catch(() => 0),
    db.riskAssessment.groupBy({ by: ['riskLevel'], _count: { riskLevel: true } }).catch(() => [])
  ])
  const metrics = [['Users', users], ['Complaints', complaints], ['Template uses', templates], ['Feedback items', feedback]]
  return <div><h1 className="text-3xl font-black">Growth Dashboard</h1><p className="mt-2 text-slate-600">Launch ke baad usage signals.</p><div className="mt-6 grid gap-4 md:grid-cols-4">{metrics.map(([label, value]) => <Card key={label}><CardHeader><CardTitle>{label}</CardTitle></CardHeader><CardContent><p className="text-3xl font-black">{value}</p></CardContent></Card>)}</div><Card className="mt-6"><CardHeader><CardTitle>Risk mix</CardTitle></CardHeader><CardContent className="grid gap-2">{risks.length ? risks.map((r: any) => <div key={r.riskLevel} className="flex justify-between rounded-xl bg-slate-50 p-3"><span>{r.riskLevel}</span><b>{r._count.riskLevel}</b></div>) : <p>No risk data yet.</p>}</CardContent></Card></div>
}
