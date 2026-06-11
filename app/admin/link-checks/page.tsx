import { requireAdmin } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CopyButton } from '@/components/ui/copy-button'

export const dynamic = 'force-dynamic'

type LinkStatus = 'UNKNOWN' | 'VERIFIED' | 'NEEDS_REVIEW' | 'BROKEN'

function statusClass(status: LinkStatus) {
  if (status === 'VERIFIED') return 'bg-emerald-50 text-emerald-800'
  if (status === 'BROKEN') return 'bg-red-50 text-red-800'
  if (status === 'NEEDS_REVIEW') return 'bg-amber-50 text-amber-900'
  return 'bg-slate-100 text-slate-700'
}

function dateLabel(value: Date | string | null) {
  if (!value) return 'Never checked'
  return new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
}

export default async function AdminLinkChecksPage() {
  await requireAdmin()
  const [links, total, verified, needsReview, broken, unknown] = await Promise.all([
    db.officialLinkCheck.findMany({ orderBy: [{ status: 'asc' }, { updatedAt: 'desc' }] }).catch(() => []),
    db.officialLinkCheck.count().catch(() => 0),
    db.officialLinkCheck.count({ where: { status: 'VERIFIED' } }).catch(() => 0),
    db.officialLinkCheck.count({ where: { status: 'NEEDS_REVIEW' } }).catch(() => 0),
    db.officialLinkCheck.count({ where: { status: 'BROKEN' } }).catch(() => 0),
    db.officialLinkCheck.count({ where: { status: 'UNKNOWN' } }).catch(() => 0)
  ])

  const cronCommand = 'curl -H "Authorization: Bearer YOUR_CRON_SECRET" "https://YOUR_DOMAIN/api/cron/link-checks?limit=25"'
  const localCommand = 'npm run link-checks:local'

  return (
    <div className="grid gap-6">
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
        <div>
          <p className="text-sm font-black uppercase tracking-wider text-primary">Official source safety</p>
          <h1 className="text-3xl font-black tracking-tight">Official link checks</h1>
          <p className="mt-2 max-w-3xl text-slate-600">Automated reachability check + manual verification queue. Use this before publishing official links, scheme deadlines, complaint routes or authority instructions.</p>
        </div>
        <div className="rounded-2xl border bg-white p-4 text-sm shadow-soft">
          <p className="font-black text-slate-950">Vercel Cron route</p>
          <code className="mt-2 block max-w-full overflow-x-auto whitespace-nowrap rounded-xl bg-slate-950 p-3 text-xs text-white">/api/cron/link-checks</code>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <Card><CardHeader><CardTitle>Total links</CardTitle></CardHeader><CardContent><p className="text-3xl font-black">{total}</p></CardContent></Card>
        <Card><CardHeader><CardTitle>Verified</CardTitle></CardHeader><CardContent><p className="text-3xl font-black text-emerald-700">{verified}</p></CardContent></Card>
        <Card><CardHeader><CardTitle>Needs review</CardTitle></CardHeader><CardContent><p className="text-3xl font-black text-amber-700">{needsReview}</p></CardContent></Card>
        <Card><CardHeader><CardTitle>Broken</CardTitle></CardHeader><CardContent><p className="text-3xl font-black text-red-700">{broken}</p></CardContent></Card>
        <Card><CardHeader><CardTitle>Unknown</CardTitle></CardHeader><CardContent><p className="text-3xl font-black text-slate-700">{unknown}</p></CardContent></Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Run automated checks</CardTitle></CardHeader>
          <CardContent className="space-y-4 text-sm text-slate-600">
            <div>
              <p className="font-bold text-slate-950">Local seed check</p>
              <pre className="mt-2 overflow-x-auto rounded-2xl bg-slate-950 p-4 text-xs text-white">{localCommand}</pre>
              <div className="mt-3"><CopyButton text={localCommand} label="Copy local command" /></div>
            </div>
            <div>
              <p className="font-bold text-slate-950">Production cron check</p>
              <pre className="mt-2 overflow-x-auto rounded-2xl bg-slate-950 p-4 text-xs text-white">{cronCommand}</pre>
              <div className="mt-3"><CopyButton text={cronCommand} label="Copy cron command" /></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Manual review rule</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm leading-7 text-slate-600">
            <p><b className="text-slate-950">Verified</b> means the URL responded successfully. It does not prove the portal text, deadline, eligibility or filing path is unchanged.</p>
            <p><b className="text-slate-950">Needs review</b> means the site may block bots, rate-limit requests or require browser login/manual inspection.</p>
            <p><b className="text-slate-950">Broken</b> must be replaced or manually confirmed before showing the link in public content.</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4">
        {links.map((link) => (
          <Card key={link.id} className={link.status === 'BROKEN' ? 'border-red-200' : link.status === 'NEEDS_REVIEW' ? 'border-amber-200' : ''}>
            <CardHeader>
              <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
                <div className="min-w-0">
                  <CardTitle className="break-words text-lg">{link.label}</CardTitle>
                  <p className="mt-1 text-xs font-bold uppercase tracking-wide text-slate-500">{link.category} · {link.state || 'National'} · {dateLabel(link.lastCheckedAt)}</p>
                </div>
                <Badge className={statusClass(link.status as LinkStatus)}>{link.status.replace('_', ' ')}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <a className="block break-all rounded-2xl bg-slate-50 p-3 text-sm font-semibold text-primary hover:underline" href={link.url} target="_blank" rel="noreferrer">{link.url}</a>
              {link.notes && <p className="rounded-2xl border bg-white p-3 text-sm leading-6 text-slate-600">{link.notes}</p>}
            </CardContent>
          </Card>
        ))}
        {links.length === 0 && <p className="rounded-2xl border bg-white p-5 text-sm text-slate-600">No links seeded yet. Run db:seed.</p>}
      </div>
    </div>
  )
}
