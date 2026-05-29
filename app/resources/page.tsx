import type { Metadata } from 'next'
import { db } from '@/lib/db'
import { officialResourceSeeds } from '@/lib/resources/seed-resources'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Official Resource Directory - HaqSathi AI', description: 'Consumer, UPI, cyber fraud and scholarship resource directory with verification warning.' }

type ResourceRow = {
  id: string
  title: string
  slug: string
  type: string
  state: string | null
  description: string
  url: string | null
  isVerified: boolean
}

async function getResources(): Promise<ResourceRow[]> {
  const rows = await db.officialResource.findMany({
    select: { id: true, title: true, slug: true, type: true, state: true, description: true, url: true, isVerified: true },
    orderBy: [{ type: 'asc' }, { title: 'asc' }]
  }).catch(() => [] as ResourceRow[])
  if (rows.length) return rows
  return officialResourceSeeds.map((item) => ({ ...item, id: item.slug }))
}

export default async function Page() {
  const resources = await getResources()
  const types = Array.from(new Set(resources.map((resource) => resource.type)))
  return (
    <main className="bg-slate-50">
      <section className="mx-auto max-w-7xl px-4 py-12">
        <div className="max-w-3xl">
          <p className="text-sm font-bold text-emerald-700">Resource Directory</p>
          <h1 className="mt-2 text-4xl font-black">Resources for verifying official portals</h1>
          <p className="mt-3 text-slate-600">HaqSathi AI is not an official authority. Always verify final links, deadlines and eligibility with the official portal or office.</p>
        </div>
        {types.map((type) => (
          <section key={type} className="mt-10">
            <h2 className="text-2xl font-black">{type}</h2>
            <div className="mt-4 grid gap-5 md:grid-cols-3">
              {resources.filter((resource) => resource.type === type).map((resource) => (
                <Card key={resource.slug}>
                  <CardHeader><CardTitle className="text-lg">{resource.title}</CardTitle></CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-600">{resource.description}</p>
                    <p className="mt-3 text-xs font-bold text-slate-500">{resource.state || 'India'} · {resource.isVerified ? 'Seed verified' : 'Verify before use'}</p>
                    {resource.url ? <a href={resource.url} target="_blank" rel="noreferrer" className="mt-4 inline-flex rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Open official resource</a> : <div className="mt-4 rounded-xl bg-amber-50 p-3 text-xs text-amber-900">Add an admin-reviewed official link before launch.</div>}
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        ))}
      </section>
    </main>
  )
}
