import { Activity, BarChart3, CheckCircle2, ExternalLink, Eye, LineChart, LockKeyhole, ShieldCheck, TrendingUp } from 'lucide-react'
import { requireAdmin } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { getAnalyticsReadinessReport } from '@/lib/analytics/growth-readiness'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Analytics Growth Readiness | Admin' }

function statusClass(status: string) {
  if (status === 'PASS' || status === 'READY_TO_TEST') return 'border-emerald-200 bg-emerald-50 text-emerald-800'
  if (status === 'BLOCKED') return 'border-rose-200 bg-rose-50 text-rose-800'
  return 'border-amber-200 bg-amber-50 text-amber-800'
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(date)
}

export default async function AdminAnalyticsReadinessPage() {
  await requireAdmin()
  const report = getAnalyticsReadinessReport()
  const [recentAnalyticsEvents, snapshots, complaintCount, userCount, supportTickets] = await Promise.all([
    db.userActivity.findMany({
      where: { entity: 'AnalyticsEvent' },
      orderBy: { createdAt: 'desc' },
      take: 10
    }).catch(() => []),
    db.launchMetricSnapshot.findMany({ orderBy: { createdAt: 'desc' }, take: 5 }).catch(() => []),
    db.complaint.count().catch(() => 0),
    db.user.count().catch(() => 0),
    db.supportTicket.count().catch(() => 0)
  ])

  const metricCards = [
    { label: 'Users', value: userCount, icon: Eye, note: 'Registered accounts' },
    { label: 'Complaints', value: complaintCount, icon: Activity, note: 'Generated complaint records' },
    { label: 'Support tickets', value: supportTickets, icon: ShieldCheck, note: 'Support demand signal' },
    { label: 'Analytics events', value: recentAnalyticsEvents.length, icon: LineChart, note: 'Latest stored sample' }
  ]

  return (
    <div className="space-y-6">
      <div className="rounded-[1.75rem] border border-emerald-100 bg-gradient-to-br from-white via-emerald-50/70 to-white p-5 shadow-soft sm:p-7">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <Badge>Phase 53 · Growth analytics</Badge>
            <h1 className="mt-3 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">Analytics growth readiness</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">
              Privacy-safe tracking, UTM readiness, provider setup aur launch evidence ko ek jagah verify karo. Existing analytics scripts preserve kiye gaye hain; yeh layer measurement ko safer aur testable banata hai.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2 rounded-2xl border border-white bg-white/80 p-3 text-center shadow-sm sm:min-w-[320px]">
            <div><p className="text-2xl font-black text-emerald-700">{report.summary.ready}</p><p className="text-xs font-bold text-slate-500">Ready</p></div>
            <div><p className="text-2xl font-black text-amber-600">{report.summary.manualRequired}</p><p className="text-xs font-bold text-slate-500">Manual</p></div>
            <div><p className="text-2xl font-black text-rose-600">{report.summary.blocked}</p><p className="text-xs font-bold text-slate-500">Blocked</p></div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metricCards.map((item) => {
          const Icon = item.icon
          return (
            <Card key={item.label}>
              <CardHeader>
                <Icon className="h-6 w-6 text-emerald-700" />
                <CardTitle>{item.value}</CardTitle>
                <CardDescription>{item.label} · {item.note}</CardDescription>
              </CardHeader>
            </Card>
          )
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Readiness controls</CardTitle>
          <CardDescription>Run <code className="rounded bg-slate-100 px-1.5 py-0.5">npm run analytics:readiness</code> and save generated JSON/CSV evidence.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            {report.controls.map((control) => (
              <div key={control.id} className="rounded-2xl border bg-white p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <h3 className="font-black text-slate-950">{control.label}</h3>
                    <p className="mt-1 text-sm leading-6 text-slate-600">{control.userValue}</p>
                    <p className="mt-2 break-words text-xs font-bold text-slate-500">{control.adminValue}</p>
                  </div>
                  <span className={`shrink-0 rounded-full border px-3 py-1 text-xs font-black ${statusClass(control.status)}`}>{control.status}</span>
                </div>
                <p className="mt-3 rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-600">{control.launchNote}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Core funnel events</CardTitle>
            <CardDescription>Only safe, coarse events should be tracked.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {report.coreEvents.map((event) => <span key={event} className="rounded-full border bg-slate-50 px-3 py-1 text-xs font-black text-slate-700">{event}</span>)}
            </div>
            <div className="mt-5 grid gap-2">
              {report.funnelSteps.map((step, index) => (
                <div key={step} className="flex items-center gap-3 rounded-2xl border bg-white p-3 text-sm text-slate-700">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-xs font-black text-emerald-700">{index + 1}</span>
                  {step}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <LockKeyhole className="h-6 w-6 text-emerald-700" />
            <CardTitle>Privacy rules</CardTitle>
            <CardDescription>Analytics must not collect sensitive complaint or document data.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm leading-6 text-slate-700">
              {report.privacyRules.map((rule) => <li key={rule} className="flex gap-2"><ShieldCheck className="mt-1 h-4 w-4 shrink-0 text-emerald-700" />{rule}</li>)}
            </ul>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent first-party analytics events</CardTitle>
            <CardDescription>Shows only safe events written through <code>/api/analytics/event</code>.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentAnalyticsEvents.length === 0 ? <p className="text-sm text-slate-500">No first-party events yet. Enable consent + first-party analytics and browse a page.</p> : recentAnalyticsEvents.map((event) => (
              <div key={event.id} className="rounded-2xl border bg-white p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <h3 className="truncate font-black text-slate-950">{event.action}</h3>
                    <p className="mt-1 text-xs font-bold uppercase tracking-wide text-slate-500">{formatDate(event.createdAt)}</p>
                  </div>
                  <span className="shrink-0 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">SAFE</span>
                </div>
                <pre className="mt-3 max-h-32 overflow-auto rounded-xl bg-slate-950 p-3 text-xs text-emerald-100">{JSON.stringify(event.metadata, null, 2)}</pre>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Launch metric snapshots</CardTitle>
            <CardDescription>Existing LaunchMetricSnapshot rows for growth/launch reporting.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {snapshots.length === 0 ? <p className="text-sm text-slate-500">No snapshots yet. Create production QA pack after real launch tests.</p> : snapshots.map((snapshot) => (
              <div key={snapshot.id} className="rounded-2xl border bg-white p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="font-black text-slate-950">{snapshot.activeUsers} active users · {snapshot.complaintCount} complaints</h3>
                    <p className="mt-1 text-xs font-bold text-slate-500">{formatDate(snapshot.createdAt)}</p>
                  </div>
                  <TrendingUp className="h-5 w-5 text-emerald-700" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <BarChart3 className="h-6 w-6 text-emerald-700" />
          <CardTitle>Minimum launch evidence</CardTitle>
          <CardDescription>Public traffic se pehle analytics evidence save karo.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="grid gap-3 text-sm text-slate-700 md:grid-cols-2">
            {report.minimumEvidence.map((item) => <li key={item} className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />{item}</li>)}
          </ul>
          <div className="mt-5 rounded-2xl border bg-slate-50 p-4">
            <p className="text-sm font-black text-slate-950">Protected API</p>
            <pre className="mt-2 overflow-x-auto rounded-xl bg-slate-950 p-3 text-xs font-bold text-emerald-100">GET /api/admin/analytics-readiness</pre>
            <a href="/api/admin/analytics-readiness" className="mt-3 inline-flex items-center gap-2 rounded-xl border bg-white px-4 py-2 text-sm font-black text-slate-700"><ExternalLink className="h-4 w-4" />Open API</a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
