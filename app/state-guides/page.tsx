import Link from 'next/link'
import { Metadata } from 'next'
import { db } from '@/lib/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { stateGuideSeeds } from '@/lib/state/seed-state-guides'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'State Guides | HaqSathi AI', description: 'India state-wise complaint, scheme, document and emergency guidance in simple language.' }

export default async function StateGuidesPage() {
  const guides = await db.stateGuide.findMany({ where: { isPublished: true }, orderBy: { stateName: 'asc' } }).catch(() => stateGuideSeeds)
  return (
    <main className="mx-auto max-w-7xl px-4 py-12">
      <div className="max-w-3xl">
        <p className="text-sm font-bold uppercase tracking-wider text-primary">State wise help</p>
        <h1 className="mt-2 text-4xl font-black tracking-tight">Apne state ke hisaab se complaint, scheme aur document guide</h1>
        <p className="mt-3 text-slate-600">Official links manually verify karein. HaqSathi simple checklist aur action plan deta hai.</p>
      </div>
      <div className="mt-8 grid gap-5 md:grid-cols-3">
        {guides.map((guide) => <Link key={guide.slug} href={`/state-guides/${guide.slug}`}><Card className="h-full hover:border-primary"><CardHeader><CardTitle>{guide.stateName}</CardTitle></CardHeader><CardContent><p className="text-sm text-slate-600">{guide.summary}</p><p className="mt-4 text-sm font-semibold text-primary">Open guide →</p></CardContent></Card></Link>)}
      </div>
    </main>
  )
}
