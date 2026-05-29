import { db } from '@/lib/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Family switchboard cases | Admin' }

export default async function Page() {
  const items = await db.familyCaseSwitchboard.findMany({ orderBy: { createdAt: 'desc' }, take: 80 }).catch(() => [])
  return <div className="grid gap-6"><div><p className="text-sm font-bold uppercase tracking-wider text-primary">Phase 31 intelligence</p><h1 className="text-3xl font-black">Family switchboard cases</h1><p className="mt-2 text-slate-600">Admin view for demand, usage and quality monitoring.</p></div><div className="grid gap-4 md:grid-cols-3"><Card><CardHeader><CardTitle>Total</CardTitle></CardHeader><CardContent><p className="text-4xl font-black">{items.length}</p></CardContent></Card><Card><CardHeader><CardTitle>Latest</CardTitle></CardHeader><CardContent><p className="text-sm text-slate-600">{items[0]?.createdAt?.toLocaleString('en-IN') || 'No data'}</p></CardContent></Card><Card><CardHeader><CardTitle>Top signal</CardTitle></CardHeader><CardContent><p className="text-sm font-bold">{items[0]?.priority || '—'}</p></CardContent></Card></div><div className="grid gap-4">{items.map((item:any)=><Card key={item.id}><CardHeader><CardTitle className="text-base">{item.priority || item.id}</CardTitle></CardHeader><CardContent><pre className="max-h-64 overflow-auto rounded-xl bg-slate-50 p-3 text-xs">{JSON.stringify(item.result, null, 2)}</pre></CardContent></Card>)}</div></div>
}
