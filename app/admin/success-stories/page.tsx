import { requireAdmin } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const dynamic = 'force-dynamic'
export default async function AdminSuccessStoriesPage() {
  await requireAdmin()
  const stories = await db.successStory.findMany({ orderBy: { createdAt: 'desc' } }).catch(() => [])
  return <div className="grid gap-6"><div><h1 className="text-3xl font-black tracking-tight">Success stories</h1><p className="mt-2 text-slate-600">Anonymized educational cases. Personal details publish mat karo.</p></div><div className="grid gap-4 md:grid-cols-2">{stories.map((story) => <Card key={story.id}><CardHeader><div className="flex items-center justify-between gap-3"><CardTitle>{story.title}</CardTitle><Badge>{story.isPublished ? 'Published' : 'Draft'}</Badge></div></CardHeader><CardContent><p className="text-sm text-slate-600">{story.summary}</p><p className="mt-3 rounded-xl bg-green-50 p-3 text-sm text-green-900">{story.outcome}</p></CardContent></Card>)}{stories.length === 0 && <p className="rounded-2xl border bg-white p-5 text-sm text-slate-600">No stories yet.</p>}</div></div>
}
