import { seoSeedPages } from '@/lib/seo/seed-pages'
import { db } from '@/lib/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const dynamic = 'force-dynamic'
export default async function Page() {
  const stored = await db.seoPage.count().catch(() => 0)
  return <div><h1 className="text-3xl font-black">SEO Pages</h1><p className="mt-2 text-slate-600">Seed pages: {seoSeedPages.length}; DB stored: {stored}</p><Card className="mt-6"><CardHeader><CardTitle>Programmatic SEO URLs</CardTitle></CardHeader><CardContent className="grid gap-3 md:grid-cols-2">{seoSeedPages.map(p => <div key={`${p.type}-${p.slug}`} className="rounded-xl border p-3"><b>{p.h1}</b><p className="text-sm text-slate-600">/{p.type === 'bank-complaint' ? 'bank-complaint' : p.type === 'upi-help' ? 'upi-help' : p.type}/{p.slug}</p></div>)}</CardContent></Card></div>
}
