import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { db } from '@/lib/db'
import { stateGuideSeeds } from '@/lib/state/seed-state-guides'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const dynamic = 'force-dynamic'
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const guide = await db.stateGuide.findUnique({ where: { slug } }).catch(() => stateGuideSeeds.find((g) => g.slug === slug) as any)
  return { title: guide ? `${guide.stateName} Guide` : 'State Guide', description: guide?.summary || 'State-wise life-admin guide.' }
}

export default async function StateGuideDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const guide = await db.stateGuide.findUnique({ where: { slug } }).catch(() => stateGuideSeeds.find((g) => g.slug === slug) as any)
  if (!guide) notFound()
  const problems = guide.popularProblems as string[]
  const docs = guide.documents as string[]
  const helplines = guide.helplines as { name: string; value: string }[]
  const tips = guide.applyTips as string[]
  return (
    <main className="mx-auto max-w-5xl px-4 py-12">
      <p className="text-sm font-bold uppercase tracking-wider text-primary">{guide.language}</p>
      <h1 className="mt-2 text-4xl font-black tracking-tight">{guide.stateName} life-admin guide</h1>
      <p className="mt-3 text-slate-600">{guide.summary}</p>
      <div className="mt-8 grid gap-5 md:grid-cols-2">
        <Card><CardHeader><CardTitle>Popular problems</CardTitle></CardHeader><CardContent><ul className="list-disc space-y-2 pl-5 text-sm text-slate-700">{problems.map((item) => <li key={item}>{item}</li>)}</ul></CardContent></Card>
        <Card><CardHeader><CardTitle>Common documents</CardTitle></CardHeader><CardContent><ul className="list-disc space-y-2 pl-5 text-sm text-slate-700">{docs.map((item) => <li key={item}>{item}</li>)}</ul></CardContent></Card>
        <Card><CardHeader><CardTitle>Helpful numbers</CardTitle></CardHeader><CardContent><ul className="space-y-2 text-sm text-slate-700">{helplines.map((item) => <li key={item.name}><b>{item.name}:</b> {item.value}</li>)}</ul></CardContent></Card>
        <Card><CardHeader><CardTitle>Safe apply tips</CardTitle></CardHeader><CardContent><ul className="list-disc space-y-2 pl-5 text-sm text-slate-700">{tips.map((item) => <li key={item}>{item}</li>)}</ul></CardContent></Card>
      </div>
      <p className="mt-8 rounded-2xl bg-amber-50 p-4 text-sm text-amber-900">Disclaimer: Ye official government website nahi hai. Final eligibility, deadlines aur links hamesha official portal par verify karein.</p>
    </main>
  )
}
