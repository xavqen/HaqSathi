import { db } from '@/lib/db'
import { requireUser } from '@/lib/auth/session'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Refund Negotiation Plans | HaqSathi AI' }

export default async function Page() {
  const user = await requireUser()
  const items = await db.refundNegotiationPlan.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' }, take: 30 }).catch(() => [])
  return <main><section className="space-y-6"><div><p className="text-sm font-bold uppercase tracking-wider text-primary">Dashboard</p><h1 className="text-3xl font-black text-slate-950">Refund Negotiation Plans</h1><p className="mt-2 text-slate-600">Saved negotiation ladders and escalation plans.</p></div><div className="grid gap-4">{items.length ? items.map((item:any) => <Card key={item.id}><CardHeader><CardTitle>{item.createdAt.toLocaleDateString('en-IN')}</CardTitle></CardHeader><CardContent><div className="flex flex-wrap gap-2"><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">{item.issueType || '—'}</span><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">{item.tone || '—'}</span><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">{item.companyName || '—'}</span></div></CardContent></Card>) : <Card><CardContent className="p-6 text-sm text-slate-600">No saved records yet.</CardContent></Card>}</div></section></main>
}
