import { db } from '@/lib/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const dynamic = 'force-dynamic'
export default async function Page() {
  const guides = await db.officialFilingGuide.findMany({ orderBy: [{ category: 'asc' }, { title: 'asc' }] })
  return <div><h1 className="text-3xl font-black">Filing Guides</h1><p className="mt-2 text-slate-600">Official filing journeys ka content database. Verification flag launch trust ke liye important hai.</p><Card className="mt-6"><CardHeader><CardTitle>{guides.length} guides</CardTitle></CardHeader><CardContent className="space-y-3">{guides.map((g) => <div key={g.id} className="rounded-2xl border p-4"><div className="flex flex-wrap gap-2"><b>{g.title}</b><Badge>{g.category}</Badge>{g.isVerified && <Badge>Verified</Badge>}</div><p className="mt-1 text-sm text-slate-600">Authority: {g.authority}</p><p className="mt-2 text-sm">{g.summary}</p></div>)}</CardContent></Card></div>
}
