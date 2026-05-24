import { requireAdmin } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const dynamic = 'force-dynamic'
export default async function AdminLinkChecksPage() {
  await requireAdmin()
  const links = await db.officialLinkCheck.findMany({ orderBy: [{ status: 'asc' }, { updatedAt: 'desc' }] }).catch(() => [])
  return <div className="grid gap-6"><div><h1 className="text-3xl font-black tracking-tight">Official link checks</h1><p className="mt-2 text-slate-600">Manual verification queue. Deep links publish karne se pehle official source verify karo.</p></div><div className="grid gap-4">{links.map((link) => <Card key={link.id}><CardHeader><div className="flex flex-wrap items-center justify-between gap-3"><CardTitle>{link.label}</CardTitle><Badge>{link.status.replace('_', ' ')}</Badge></div></CardHeader><CardContent><p className="break-all text-sm text-slate-600">{link.url || 'No URL added yet'}</p><p className="mt-2 text-sm text-slate-600"><b>Category:</b> {link.category}{link.state ? ` · ${link.state}` : ''}</p>{link.notes && <p className="mt-3 rounded-xl bg-slate-50 p-3 text-sm">{link.notes}</p>}</CardContent></Card>)}{links.length === 0 && <p className="rounded-2xl border bg-white p-5 text-sm text-slate-600">No links seeded yet. Run db:seed.</p>}</div></div>
}
