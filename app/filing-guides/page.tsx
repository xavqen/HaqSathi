import Link from 'next/link'
import { db } from '@/lib/db'
import { filingGuideSeeds } from '@/lib/filing/seed-guides'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Official Filing Guides | HaqSathi AI', description: 'Consumer, bank, cyber, RTI and scholarship filing guides in simple Hinglish.' }

export default async function Page() {
  const guides = await db.officialFilingGuide.findMany({ orderBy: [{ category: 'asc' }, { title: 'asc' }] }).catch(() => filingGuideSeeds as any[])
  return <main className="bg-slate-50"><section className="mx-auto max-w-7xl px-4 py-12"><p className="text-sm font-bold uppercase tracking-wider text-primary">Verified workflow library</p><h1 className="mt-2 text-4xl font-black tracking-tight text-slate-950">Filing guides</h1><p className="mt-3 max-w-2xl text-slate-600">Complaint submit karne se pehle exact evidence, steps, warnings aur official-verification reminder yahan se samjho.</p><div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{guides.map((guide: any) => <Link key={guide.slug} href={`/filing-guides/${guide.slug}`}><Card className="h-full transition hover:-translate-y-1 hover:shadow-lg"><CardHeader><div className="flex gap-2"><Badge>{guide.category}</Badge>{guide.isVerified && <Badge>Verified</Badge>}</div><CardTitle className="mt-3">{guide.title}</CardTitle></CardHeader><CardContent><p className="text-sm text-slate-600">{guide.summary}</p><p className="mt-4 text-sm font-bold text-primary">Open guide →</p></CardContent></Card></Link>)}</div></section></main>
}
