import { Metadata } from 'next'
import { db } from '@/lib/db'
import { successStorySeeds } from '@/lib/stories/seed-success-stories'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Anonymous Success Stories | HaqSathi AI', description: 'Educational examples showing how organized complaint follow-up can help users.' }

export default async function SuccessStoriesPage() {
  const stories = await db.successStory.findMany({ where: { isPublished: true }, orderBy: { createdAt: 'desc' } }).catch(() => successStorySeeds)
  return (
    <main className="mx-auto max-w-7xl px-4 py-12">
      <h1 className="text-4xl font-black tracking-tight">Anonymous success stories</h1>
      <p className="mt-3 max-w-3xl text-slate-600">These examples are educational. Each result depends on the company, bank, evidence and official process.</p>
      <div className="mt-8 grid gap-5 md:grid-cols-3">
        {stories.map((story) => <Card key={story.slug}><CardHeader><p className="text-xs font-bold uppercase tracking-wider text-primary">{story.category} {story.state ? `· ${story.state}` : ''}</p><CardTitle>{story.title}</CardTitle></CardHeader><CardContent><p className="text-sm text-slate-600">{story.summary}</p><p className="mt-4 rounded-xl bg-green-50 p-3 text-sm text-green-900"><b>Outcome:</b> {story.outcome}</p></CardContent></Card>)}
      </div>
    </main>
  )
}
