import { db } from '@/lib/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Public post safety monitor | HaqSathi AI Admin' }

export default async function Page() {
  const items = await db.publicPostSafetyCheck.findMany({ orderBy: { createdAt: 'desc' }, take: 50 }).catch(() => [])
  const avg = items.length ? Math.round(items.reduce((sum:any, item:any) => sum + Number(item.riskScore || 0), 0) / items.length) : 0
  return <div className="grid gap-6"><div><p className="text-sm font-bold uppercase tracking-wider text-primary">Admin intelligence</p><h1 className="text-3xl font-black">Public post safety monitor</h1><p className="mt-2 text-slate-600">Monitor demand, quality and user behavior for this Phase 30 feature.</p></div><div className="grid gap-4 md:grid-cols-3"><Card><CardHeader><CardTitle>Total</CardTitle></CardHeader><CardContent><p className="text-3xl font-black">{items.length}</p></CardContent></Card><Card><CardHeader><CardTitle>Average score/value</CardTitle></CardHeader><CardContent><p className="text-3xl font-black">{avg}</p></CardContent></Card><Card><CardHeader><CardTitle>Latest</CardTitle></CardHeader><CardContent><p className="text-sm text-slate-600">{items[0]?.createdAt?.toLocaleString('en-IN') || 'No records'}</p></CardContent></Card></div><div className="grid gap-4">{items.map((item:any)=><Card key={item.id}><CardHeader><CardTitle className="text-base">{item.createdAt.toLocaleDateString('en-IN')} · {item.riskScore ?? '—'}</CardTitle></CardHeader><CardContent><pre className="max-h-72 overflow-auto rounded-xl bg-slate-50 p-3 text-xs">{JSON.stringify(item.result, null, 2)}</pre></CardContent></Card>)}</div></div>
}
