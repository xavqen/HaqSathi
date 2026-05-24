import { requireAdmin } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const dynamic = 'force-dynamic'
export default async function AdminStateGuidesPage() {
  await requireAdmin()
  const guides = await db.stateGuide.findMany({ orderBy: { stateName: 'asc' } }).catch(() => [])
  return <div className="grid gap-6"><div><h1 className="text-3xl font-black tracking-tight">State guides</h1><p className="mt-2 text-slate-600">State-wise public pages coverage and publishing status.</p></div><div className="grid gap-4 md:grid-cols-2">{guides.map((guide) => <Card key={guide.id}><CardHeader><div className="flex items-center justify-between gap-3"><CardTitle>{guide.stateName}</CardTitle><Badge>{guide.isPublished ? 'Published' : 'Draft'}</Badge></div></CardHeader><CardContent><p className="text-sm text-slate-600">{guide.summary}</p><p className="mt-3 text-xs text-slate-500">/{guide.slug}</p></CardContent></Card>)}{guides.length === 0 && <p className="rounded-2xl border bg-white p-5 text-sm text-slate-600">No state guides yet.</p>}</div></div>
}
