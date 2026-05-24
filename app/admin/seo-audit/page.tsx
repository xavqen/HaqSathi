import { getSeoAudit } from '@/lib/launch/seo-audit'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default async function Page() {
  const items = await getSeoAudit()
  const passed = items.filter((item) => item.ok).length
  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-3xl font-black">SEO Audit</h1>
        <p className="mt-2 text-slate-600">Sitemap, robots, programmatic SEO routes, seed content aur local SEO readiness.</p>
      </div>
      <Card><CardHeader><CardTitle>SEO readiness</CardTitle></CardHeader><CardContent><p className="text-4xl font-black">{passed}/{items.length}</p></CardContent></Card>
      <div className="grid gap-4 md:grid-cols-2">
        {items.map((item) => <Card key={`${item.area}-${item.item}`}><CardHeader><div className="flex items-center justify-between gap-3"><CardTitle className="text-base">{item.item}</CardTitle><Badge>{item.area}</Badge></div></CardHeader><CardContent><p className={item.ok ? 'font-bold text-emerald-700' : 'font-bold text-red-700'}>{item.ok ? 'PASS' : 'NEEDS ACTION'}</p><p className="mt-1 text-sm text-slate-600">{item.note}</p></CardContent></Card>)}
      </div>
    </div>
  )
}
