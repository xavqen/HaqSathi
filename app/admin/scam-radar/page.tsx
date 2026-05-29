import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth/session'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Scam radar reports | Admin' }

export default async function Page() {
  await requireAdmin()
  const items = await db.scamRadarReport.findMany({ orderBy: { createdAt: 'desc' }, take: 50 }).catch(() => [])
  const grouped = await db.scamRadarReport.groupBy({ by: ['riskLevel'], _count: { riskLevel: true }, orderBy: { _count: { riskLevel: 'desc' } }, take: 20 }).catch(() => [])
  return <main><section className="space-y-6"><div><p className="text-sm font-bold uppercase tracking-wider text-primary">Admin intelligence</p><h1 className="text-3xl font-black text-slate-950">Scam radar reports</h1><p className="mt-2 text-slate-600">Usage, demand and safety pattern monitoring.</p></div><div className="grid gap-4 md:grid-cols-3">{grouped.map((g:any)=><Card key={String(g.riskLevel)}><CardHeader><CardTitle>{g.riskLevel || 'Unknown'}</CardTitle></CardHeader><CardContent><p className="text-3xl font-black">{g._count.riskLevel}</p></CardContent></Card>)}</div><Card><CardHeader><CardTitle>Latest records</CardTitle></CardHeader><CardContent><div className="space-y-3">{items.map((item:any)=><div key={item.id} className="rounded-2xl bg-slate-50 p-4 text-sm"><p className="font-bold">{item.riskLevel || 'Record'}</p><p className="text-slate-500">{item.createdAt.toLocaleString('en-IN')}</p></div>)}</div></CardContent></Card></section></main>
}
