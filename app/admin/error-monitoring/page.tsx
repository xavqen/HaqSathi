import { db } from '@/lib/db'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const dynamic = 'force-dynamic'

type EventMeta = {
  message?: string
  path?: string
  source?: string
  level?: string
  fingerprint?: string
  userAgent?: string
  release?: string
  occurredAt?: string
}

function readMeta(value: unknown): EventMeta {
  if (!value || typeof value !== 'object') return {}
  return value as EventMeta
}

function statusColor(level?: string) {
  if (level === 'critical') return 'bg-red-50 text-red-700 border-red-200'
  if (level === 'error') return 'bg-orange-50 text-orange-700 border-orange-200'
  if (level === 'warning') return 'bg-amber-50 text-amber-700 border-amber-200'
  return 'bg-slate-50 text-slate-700 border-slate-200'
}

export default async function Page() {
  const [events, openIncidents] = await Promise.all([
    db.userActivity.findMany({ where: { action: 'CLIENT_ERROR' }, orderBy: { createdAt: 'desc' }, take: 80 }).catch(() => []),
    db.incidentReport.count({ where: { status: 'OPEN' } }).catch(() => 0)
  ])

  const counts = events.reduce((acc, event: any) => {
    const level = readMeta(event.metadata).level || 'unknown'
    acc[level] = (acc[level] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const cards = [
    ['Recent events', events.length],
    ['Critical', counts.critical || 0],
    ['Errors', counts.error || 0],
    ['Warnings', counts.warning || 0],
    ['Open incidents', openIncidents]
  ]

  return (
    <div className="grid gap-6">
      <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-soft sm:p-6">
        <p className="text-sm font-black uppercase tracking-[0.18em] text-emerald-700">Production monitoring</p>
        <h1 className="mt-2 text-3xl font-black text-slate-950 sm:text-4xl">Error monitoring center</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">Browser errors, unhandled promise rejections, critical app failures, release fingerprints and incident triage signals in one place.</p>
        <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold text-slate-600">
          <span className="rounded-full border bg-slate-50 px-3 py-2">POST /api/system/client-error</span>
          <span className="rounded-full border bg-slate-50 px-3 py-2">GET /api/system/heartbeat</span>
          <span className="rounded-full border bg-slate-50 px-3 py-2">npm run error-monitor:local</span>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {cards.map(([label, value]) => (
          <Card key={String(label)}>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-600">{label}</CardTitle></CardHeader>
            <CardContent><div className="text-3xl font-black text-slate-950">{value}</div></CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Latest captured events</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {events.length === 0 ? (
              <div className="rounded-2xl border border-dashed bg-slate-50 p-5 text-sm font-semibold text-slate-600">No client errors captured yet. Keep CLIENT_ERROR_LOG_DRY_RUN=false in staging/production to store events.</div>
            ) : events.map((event) => {
              const meta = readMeta(event.metadata)
              return (
                <div key={event.id} className="rounded-2xl border bg-white p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="break-words text-sm font-black text-slate-950">{meta.message || 'Unknown error'}</p>
                      <p className="mt-1 break-all text-xs font-semibold text-slate-500">{meta.path || '/'} · {meta.source || 'browser'} · {meta.fingerprint || event.entityId || 'no-fingerprint'}</p>
                    </div>
                    <Badge className={statusColor(meta.level)}>{meta.level || 'unknown'}</Badge>
                  </div>
                  <div className="mt-3 grid gap-2 text-xs text-slate-600 md:grid-cols-3">
                    <span className="rounded-xl bg-slate-50 p-2">Release: {meta.release || 'local'}</span>
                    <span className="rounded-xl bg-slate-50 p-2">Captured: {event.createdAt.toLocaleString('en-IN')}</span>
                    <span className="truncate rounded-xl bg-slate-50 p-2">UA: {meta.userAgent || 'unknown'}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
