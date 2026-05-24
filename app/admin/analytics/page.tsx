import { db } from '@/lib/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const dynamic = 'force-dynamic'
export default async function Page() {
  const grouped = await db.complaint.groupBy({ by: ['type'], _count: { type: true }, orderBy: { _count: { type: 'desc' } }, take: 12 }).catch(() => [])
  return <div><div className="flex flex-wrap items-start justify-between gap-3"><div><h1 className="text-3xl font-black">Analytics</h1><p className="mt-2 text-slate-600">Export reports aur popular categories track karo.</p></div><div className="flex gap-2"><a className="rounded-xl border bg-white px-4 py-2 text-sm font-semibold" href="/api/admin/export/complaints">Export complaints</a><a className="rounded-xl border bg-white px-4 py-2 text-sm font-semibold" href="/api/admin/export/users">Export users</a></div></div><Card className="mt-6"><CardHeader><CardTitle>Popular complaint categories</CardTitle></CardHeader><CardContent className="space-y-3">{grouped.length ? grouped.map(g => <div key={g.type} className="flex items-center justify-between rounded-xl border p-3"><span>{g.type}</span><b>{g._count.type}</b></div>) : <p className="text-slate-500">No analytics yet.</p>}</CardContent></Card></div>
}
