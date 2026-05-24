import { db } from '@/lib/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const dynamic = 'force-dynamic'
export default async function Page() {
  const complaints = await db.complaint.findMany({ orderBy: { createdAt: 'desc' }, take: 100, include: { user: { select: { email: true } } } })
  return <div><h1 className="text-3xl font-black">Complaints</h1><Card className="mt-6"><CardHeader><CardTitle>Latest generated complaints</CardTitle></CardHeader><CardContent className="space-y-3">{complaints.map(c => <div key={c.id} className="rounded-xl border p-4"><b>{c.type}</b><p className="text-sm text-slate-600">{c.companyName} · {c.user?.email || 'guest'} · {c.createdAt.toDateString()}</p></div>)}</CardContent></Card></div>
}
