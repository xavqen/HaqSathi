import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth/session'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const dynamic = 'force-dynamic'
export default async function Page() {
  await requireAdmin()
  const keywords = await db.seoKeywordOpportunity.findMany({ orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }], take: 200 })
  const top = keywords.slice(0, 10)
  return <div><h1 className="text-3xl font-black">SEO Keyword Opportunities</h1><p className="mt-2 text-slate-600">Programmatic SEO ke liye next pages ka backlog.</p><div className="mt-6 grid gap-4 md:grid-cols-4"><Card><CardContent className="pt-6"><p className="text-sm text-slate-500">Total ideas</p><p className="text-3xl font-black">{keywords.length}</p></CardContent></Card><Card><CardContent className="pt-6"><p className="text-sm text-slate-500">Ready</p><p className="text-3xl font-black">{keywords.filter((x) => x.status === 'READY').length}</p></CardContent></Card><Card><CardContent className="pt-6"><p className="text-sm text-slate-500">Draft</p><p className="text-3xl font-black">{keywords.filter((x) => x.status === 'DRAFT').length}</p></CardContent></Card><Card><CardContent className="pt-6"><p className="text-sm text-slate-500">Ideas</p><p className="text-3xl font-black">{keywords.filter((x) => x.status === 'IDEA').length}</p></CardContent></Card></div><Card className="mt-6"><CardHeader><CardTitle>Top Priority Keywords</CardTitle></CardHeader><CardContent className="space-y-3">{top.map((item) => <div key={item.id} className="rounded-2xl border p-4"><div className="flex flex-wrap gap-2"><b>{item.keyword}</b><Badge>Priority {item.priority}</Badge><Badge>{item.category}</Badge><Badge>{item.pageType}</Badge><Badge>{item.status}</Badge></div><p className="mt-2 text-sm text-slate-600">Intent: {item.intent}</p>{item.notes && <p className="mt-1 text-xs text-slate-500">{item.notes}</p>}</div>)}</CardContent></Card></div>
}
