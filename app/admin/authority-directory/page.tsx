import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth/session'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const dynamic = 'force-dynamic'
export default async function Page() {
  await requireAdmin()
  const entries = await db.authorityDirectoryEntry.findMany({ orderBy: [{ category: 'asc' }, { name: 'asc' }], take: 200 })
  const verified = entries.filter((x) => x.verified).length
  return <div><h1 className="text-3xl font-black">Authority Directory Admin</h1><p className="mt-2 text-slate-600">Seeded authority/resource map. Real launch se pehle links manually verify karo.</p><div className="mt-6 grid gap-4 md:grid-cols-3"><Card><CardContent className="pt-6"><p className="text-sm text-slate-500">Entries</p><p className="text-3xl font-black">{entries.length}</p></CardContent></Card><Card><CardContent className="pt-6"><p className="text-sm text-slate-500">Verified</p><p className="text-3xl font-black">{verified}</p></CardContent></Card><Card><CardContent className="pt-6"><p className="text-sm text-slate-500">Need review</p><p className="text-3xl font-black">{entries.length - verified}</p></CardContent></Card></div><Card className="mt-6"><CardHeader><CardTitle>Directory Entries</CardTitle></CardHeader><CardContent className="space-y-3">{entries.map((item) => <div key={item.id} className="rounded-2xl border p-4"><div className="flex flex-wrap gap-2"><b>{item.name}</b><Badge>{item.category}</Badge>{item.state && <Badge>{item.state}</Badge>}<Badge>{item.verified ? 'Verified' : 'Needs review'}</Badge></div><p className="mt-2 text-sm text-slate-600">{item.description}</p></div>)}</CardContent></Card></div>
}
