import { Activity, AlertTriangle, BellRing, CheckCircle2, Gauge, LineChart, ServerCog, ShieldCheck, TimerReset } from 'lucide-react'
import { requireAdmin } from '@/lib/auth/session'
import { getObservabilitySloReadinessReport, type ObservabilityReadinessPriority, type ObservabilityReadinessStatus } from '@/lib/operations/observability-slo-readiness'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

function statusClass(status: ObservabilityReadinessStatus) {
  if (status === 'PASS') return 'border-emerald-200 bg-emerald-50 text-emerald-800'
  if (status === 'READY_TO_TEST') return 'border-blue-200 bg-blue-50 text-blue-800'
  if (status === 'MANUAL_REQUIRED') return 'border-amber-200 bg-amber-50 text-amber-800'
  return 'border-rose-200 bg-rose-50 text-rose-800'
}

function priorityClass(priority: ObservabilityReadinessPriority) {
  if (priority === 'P0') return 'border-rose-200 bg-rose-50 text-rose-800'
  if (priority === 'P1') return 'border-amber-200 bg-amber-50 text-amber-800'
  return 'border-slate-200 bg-slate-50 text-slate-700'
}

export default async function ObservabilitySloPage() {
  await requireAdmin()
  const report = getObservabilitySloReadinessReport()

  return (
    <div className="grid gap-6">
      <section className="rounded-[2rem] border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-blue-50 p-5 shadow-soft sm:p-7">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <Badge>Phase 79</Badge>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Observability &amp; SLO readiness</h1>
            <p className="mt-3 text-sm leading-6 text-slate-700 sm:text-base">
              Launch guard for uptime probes, heartbeat checks, error-rate budgets, API latency, cron health, alert drills and production dashboards.
            </p>
          </div>
          <div className="rounded-2xl border border-emerald-100 bg-white p-4 text-sm shadow-sm lg:min-w-[18rem]">
            <p className="font-black text-slate-950">Next action</p>
            <p className="mt-2 leading-6 text-slate-600">{report.nextAction}</p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card><CardHeader className="pb-2"><CardDescription>Total controls</CardDescription><CardTitle className="text-3xl">{report.summary.totalControls}</CardTitle></CardHeader></Card>
        <Card><CardHeader className="pb-2"><CardDescription>Ready / pass</CardDescription><CardTitle className="text-3xl text-emerald-700">{report.summary.ready}</CardTitle></CardHeader></Card>
        <Card><CardHeader className="pb-2"><CardDescription>Manual required</CardDescription><CardTitle className="text-3xl text-amber-700">{report.summary.manualRequired}</CardTitle></CardHeader></Card>
        <Card><CardHeader className="pb-2"><CardDescription>SLO lanes</CardDescription><CardTitle className="text-3xl text-slate-950">{report.summary.sloLanes}</CardTitle></CardHeader></Card>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
        <Card>
          <CardHeader>
            <ServerCog className="h-6 w-6 text-emerald-700" />
            <CardTitle>Launch observability controls</CardTitle>
            <CardDescription>These checks make sure production failures are visible before users report them.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {report.controls.map((item) => (
                <div key={item.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`rounded-full border px-2.5 py-1 text-[11px] font-black ${priorityClass(item.priority)}`}>{item.priority}</span>
                        <span className={`rounded-full border px-2.5 py-1 text-[11px] font-black ${statusClass(item.status)}`}>{item.status}</span>
                      </div>
                      <h2 className="mt-3 text-base font-black text-slate-950">{item.label}</h2>
                      <p className="mt-1 break-words font-mono text-xs text-slate-500">{item.envValue}</p>
                    </div>
                  </div>
                  <div className="mt-3 grid gap-3 md:grid-cols-3">
                    <div><p className="text-xs font-black uppercase tracking-wide text-slate-500">Pass condition</p><p className="mt-1 text-sm leading-6 text-slate-700">{item.passCondition}</p></div>
                    <div><p className="text-xs font-black uppercase tracking-wide text-slate-500">Evidence</p><p className="mt-1 text-sm leading-6 text-slate-700">{item.evidenceRequired}</p></div>
                    <div><p className="text-xs font-black uppercase tracking-wide text-slate-500">Risk</p><p className="mt-1 text-sm leading-6 text-slate-700">{item.riskIfSkipped}</p></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <ShieldCheck className="h-6 w-6 text-emerald-700" />
              <CardTitle>Command</CardTitle>
              <CardDescription>Generate evidence and review protected API output.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-2xl bg-slate-950 p-4 font-mono text-xs font-bold leading-6 text-emerald-100">
                npm run observability:readiness<br />
                /api/admin/observability-slo-readiness
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <BellRing className="h-6 w-6 text-amber-700" />
              <CardTitle>Launch alert triggers</CardTitle>
              <CardDescription>Escalate these to incident response during public traffic.</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="grid gap-2 text-sm leading-6 text-slate-700">
                {report.launchAlerts.map((item) => <li key={item} className="flex gap-2"><AlertTriangle className="mt-1 h-4 w-4 shrink-0 text-amber-600" />{item}</li>)}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <Gauge className="h-6 w-6 text-emerald-700" />
          <CardTitle>SLO lanes</CardTitle>
          <CardDescription>Simple, launch-ready reliability targets for HaqSathi production traffic.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {report.sloLanes.map((lane) => (
              <div key={lane.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded-full border px-2 py-0.5 text-[10px] font-black ${priorityClass(lane.priority)}`}>{lane.priority}</span>
                  <p className="font-black text-slate-950">{lane.label}</p>
                </div>
                <p className="mt-2 rounded-xl bg-slate-50 p-3 text-sm font-bold leading-6 text-slate-800">{lane.target}</p>
                <div className="mt-3 grid gap-3">
                  <div><p className="text-xs font-black uppercase tracking-wide text-slate-500">Signal</p><p className="mt-1 text-sm leading-6 text-slate-700">{lane.signal}</p></div>
                  <div><p className="text-xs font-black uppercase tracking-wide text-slate-500">Alert rule</p><p className="mt-1 text-sm leading-6 text-slate-700">{lane.alertRule}</p></div>
                  <div><p className="text-xs font-black uppercase tracking-wide text-slate-500">Evidence</p><p className="mt-1 text-sm leading-6 text-slate-700">{lane.evidenceRequired}</p></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <LineChart className="h-6 w-6 text-emerald-700" />
            <CardTitle>Dashboards to wire</CardTitle>
            <CardDescription>Minimum visibility before public traffic.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="grid gap-2 text-sm leading-6 text-slate-700">
              {report.dashboards.map((item) => <li key={item} className="flex gap-2"><Activity className="mt-1 h-4 w-4 shrink-0 text-emerald-700" />{item}</li>)}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <TimerReset className="h-6 w-6 text-emerald-700" />
            <CardTitle>Evidence to save</CardTitle>
            <CardDescription>Do not mark launch monitoring ready without these files/screenshots.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                'Production uptime probe screenshot',
                'Heartbeat JSON screenshot from deployed URL',
                'Error dashboard with redacted sample event',
                'Alert drill proof sent to owner',
                'SLO/error-budget checklist screenshot',
                'Cron health or evidence folder output'
              ].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-white p-4 text-sm font-bold leading-6 text-slate-700"><CheckCircle2 className="mb-2 h-4 w-4 text-emerald-700" />{item}</div>)}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
