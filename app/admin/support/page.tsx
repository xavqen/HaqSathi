import { db } from '@/lib/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const dynamic = 'force-dynamic'
export default async function Page() {
  const tickets = await db.supportTicket.findMany({ include: { user: { select: { email: true } } }, orderBy: { createdAt: 'desc' }, take: 100 }).catch(() => [])
  return <div><h1 className="text-3xl font-black">Support Tickets</h1><Card className="mt-6"><CardHeader><CardTitle>Latest user tickets</CardTitle></CardHeader><CardContent className="space-y-3">{tickets.length === 0 ? <p className="text-slate-500">No tickets yet.</p> : tickets.map(t => <div key={t.id} className="rounded-xl border p-3"><div className="flex flex-wrap justify-between gap-2"><b>{t.subject}</b><span className="text-sm text-slate-500">{t.status}</span></div><p className="text-sm text-slate-500">{t.user?.email || 'guest'} · {t.category} · {t.createdAt.toDateString()}</p><p className="mt-2 text-sm text-slate-700">{t.message}</p></div>)}</CardContent></Card></div>
}
