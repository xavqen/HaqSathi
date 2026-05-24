import type { Metadata } from 'next'
import { db } from '@/lib/db'
import { officialResourceSeeds } from '@/lib/resources/seed-resources'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Official Resource Directory - HaqSathi AI', description: 'Consumer, UPI, cyber fraud and scholarship resource directory with verification warning.' }

async function getResources() {
  const rows = await db.officialResource.findMany({ orderBy: [{ type: 'asc' }, { title: 'asc' }] }).catch(() => [])
  if (rows.length) return rows
  return officialResourceSeeds.map((item) => ({ ...item, id: item.slug, createdAt: new Date(), updatedAt: new Date() }))
}

export default async function Page() {
  const resources = await getResources()
  const types = Array.from(new Set(resources.map((r) => r.type)))
  return <main className="bg-slate-50"><section className="mx-auto max-w-7xl px-4 py-12"><div className="max-w-3xl"><p className="text-sm font-bold text-emerald-700">Resource Directory</p><h1 className="mt-2 text-4xl font-black">Official portal verify karne ke resources</h1><p className="mt-3 text-slate-600">HaqSathi AI official authority nahi hai. Final link, deadline aur eligibility hamesha official portal/office se verify karein.</p></div>{types.map((type) => <section key={type} className="mt-10"><h2 className="text-2xl font-black">{type}</h2><div className="mt-4 grid gap-5 md:grid-cols-3">{resources.filter((r) => r.type === type).map((r) => <Card key={r.slug}><CardHeader><CardTitle className="text-lg">{r.title}</CardTitle></CardHeader><CardContent><p className="text-sm text-slate-600">{r.description}</p><p className="mt-3 text-xs font-bold text-slate-500">{r.state || 'India'} · {r.isVerified ? 'Verified' : 'Verify before use'}</p>{r.url ? <a href={r.url} target="_blank" className="mt-4 inline-flex rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Open</a> : <div className="mt-4 rounded-xl bg-amber-50 p-3 text-xs text-amber-900">URL placeholder: admin verified link add kare.</div>}</CardContent></Card>)}</div></section>)}</section></main>
}
