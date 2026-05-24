import { requireAdmin } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { seoSeedPages } from '@/lib/seo/seed-pages'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'SEO Content Ideas | HaqSathi Admin' }

export default async function Page() {
  await requireAdmin()
  const searches = await db.schemeSearch.groupBy({ by: ['state', 'purpose'], _count: { purpose: true }, orderBy: { _count: { purpose: 'desc' } }, take: 10 }).catch(() => [])
  const complaints = await db.complaint.groupBy({ by: ['type', 'companyName'], _count: { type: true }, orderBy: { _count: { type: 'desc' } }, take: 10 }).catch(() => [])
  return <div><h1 className="text-3xl font-black">SEO Content Ideas</h1><p className="mt-2 text-slate-600">User intent se programmatic pages ideas.</p><div className="mt-6 grid gap-5 lg:grid-cols-2"><Card><CardHeader><CardTitle>Complaint page ideas</CardTitle></CardHeader><CardContent className="grid gap-2">{complaints.map((c: any) => <div key={`${c.type}-${c.companyName}`} className="rounded-xl bg-slate-50 p-3"><b>{c.companyName} {c.type}</b><p className="text-sm text-slate-600">Search count signal: {c._count.type}</p></div>)}</CardContent></Card><Card><CardHeader><CardTitle>Scheme page ideas</CardTitle></CardHeader><CardContent className="grid gap-2">{searches.map((s: any) => <div key={`${s.state}-${s.purpose}`} className="rounded-xl bg-slate-50 p-3"><b>{s.state} {s.purpose}</b><p className="text-sm text-slate-600">Search count signal: {s._count.purpose}</p></div>)}</CardContent></Card></div><Card className="mt-6"><CardHeader><CardTitle>Seed SEO coverage</CardTitle></CardHeader><CardContent><p className="text-3xl font-black">{seoSeedPages.length}</p><p className="text-sm text-slate-600">Programmatic pages currently seeded.</p></CardContent></Card></div>
}
