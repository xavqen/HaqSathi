import Link from 'next/link'
import { requireAdmin } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const dynamic = 'force-dynamic'
export default async function AdminDataQualityPage() {
  await requireAdmin()
  const [links, unknownLinks, states, unpublishedStories, lowPromptScores] = await Promise.all([
    db.officialLinkCheck.count().catch(() => 0),
    db.officialLinkCheck.count({ where: { status: { in: ['UNKNOWN', 'NEEDS_REVIEW', 'BROKEN'] } } }).catch(() => 0),
    db.stateGuide.count().catch(() => 0),
    db.successStory.count({ where: { isPublished: false } }).catch(() => 0),
    db.promptTestRun.count({ where: { score: { lt: 70 } } }).catch(() => 0)
  ])
  return (
    <div className="grid gap-6">
      <div><h1 className="text-3xl font-black tracking-tight">Data quality center</h1><p className="mt-2 text-slate-600">Official links, state coverage, stories and prompt quality ka launch checklist.</p></div>
      <div className="grid gap-4 md:grid-cols-5">
        <Card><CardHeader><CardTitle>Tracked links</CardTitle></CardHeader><CardContent><p className="text-3xl font-black">{links}</p></CardContent></Card>
        <Card><CardHeader><CardTitle>Needs review</CardTitle></CardHeader><CardContent><p className="text-3xl font-black">{unknownLinks}</p></CardContent></Card>
        <Card><CardHeader><CardTitle>State guides</CardTitle></CardHeader><CardContent><p className="text-3xl font-black">{states}</p></CardContent></Card>
        <Card><CardHeader><CardTitle>Story drafts</CardTitle></CardHeader><CardContent><p className="text-3xl font-black">{unpublishedStories}</p></CardContent></Card>
        <Card><CardHeader><CardTitle>Low AI scores</CardTitle></CardHeader><CardContent><p className="text-3xl font-black">{lowPromptScores}</p></CardContent></Card>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <Link className="rounded-2xl border bg-white p-5 font-bold hover:border-primary" href="/admin/link-checks">Review official links →</Link>
        <Link className="rounded-2xl border bg-white p-5 font-bold hover:border-primary" href="/admin/state-guides">Check state guides →</Link>
        <Link className="rounded-2xl border bg-white p-5 font-bold hover:border-primary" href="/admin/prompt-lab">Prompt lab →</Link>
        <Link className="rounded-2xl border bg-white p-5 font-bold hover:border-primary" href="/admin/success-stories">Success stories →</Link>
      </div>
    </div>
  )
}
