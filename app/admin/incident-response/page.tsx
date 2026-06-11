import { AlertTriangle, CheckCircle2, Clock3, FileCheck2, Flame, LifeBuoy, ListChecks, PhoneCall, RadioTower, RotateCcw, ShieldCheck } from 'lucide-react'
import { requireAdmin } from '@/lib/auth/session'
import { getIncidentResponseReadinessReport, type IncidentReadinessPriority, type IncidentReadinessStatus } from '@/lib/operations/incident-response-readiness'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

function statusClass(status: IncidentReadinessStatus) {
  if (status === 'PASS') return 'border-emerald-200 bg-emerald-50 text-emerald-800'
  if (status === 'READY_TO_TEST') return 'border-blue-200 bg-blue-50 text-blue-800'
  if (status === 'MANUAL_REQUIRED') return 'border-amber-200 bg-amber-50 text-amber-800'
  return 'border-rose-200 bg-rose-50 text-rose-800'
}

function priorityClass(priority: IncidentReadinessPriority) {
  if (priority === 'P0') return 'border-rose-200 bg-rose-50 text-rose-800'
  if (priority === 'P1') return 'border-amber-200 bg-amber-50 text-amber-800'
  return 'border-slate-200 bg-slate-50 text-slate-700'
}

export default async function IncidentResponsePage() {
  await requireAdmin()
  const report = getIncidentResponseReadinessReport()

  return (
    <div className="grid gap-6">
      <section className="rounded-[2rem] border border-rose-100 bg-gradient-to-br from-rose-50 via-white to-emerald-50 p-5 shadow-soft sm:p-7">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <Badge>Phase 78</Badge>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Incident response readiness</h1>
            <p className="mt-3 text-sm leading-6 text-slate-700 sm:text-base">
              Launch guard for on-call ownership, SEV levels, rollback drills, alert channels, status communication, support escalation and evidence preservation.
            </p>
          </div>
          <div className="rounded-2xl border border-rose-100 bg-white p-4 text-sm shadow-sm lg:min-w-[18rem]">
            <p className="font-black text-slate-950">Next action</p>
            <p className="mt-2 leading-6 text-slate-600">{report.nextAction}</p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total controls</CardDescription>
            <CardTitle className="text-3xl">{report.summary.totalControls}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Ready / pass</CardDescription>
            <CardTitle className="text-3xl text-emerald-700">{report.summary.ready}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Manual required</CardDescription>
            <CardTitle className="text-3xl text-amber-700">{report.summary.manualRequired}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Severity lanes</CardDescription>
            <CardTitle className="text-3xl text-slate-950">{report.summary.severityLanes}</CardTitle>
          </CardHeader>
        </Card>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
        <Card>
          <CardHeader>
            <RadioTower className="h-6 w-6 text-rose-700" />
            <CardTitle>Incident launch controls</CardTitle>
            <CardDescription>Keep launch calm when payment, auth, vault, AI, mobile UI or data freshness breaks under real traffic.</CardDescription>
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
                    <div>
                      <p className="text-xs font-black uppercase tracking-wide text-slate-500">Pass condition</p>
                      <p className="mt-1 text-sm leading-6 text-slate-700">{item.passCondition}</p>
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-wide text-slate-500">Evidence</p>
                      <p className="mt-1 text-sm leading-6 text-slate-700">{item.evidenceRequired}</p>
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-wide text-slate-500">Risk</p>
                      <p className="mt-1 text-sm leading-6 text-slate-700">{item.riskIfSkipped}</p>
                    </div>
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
                npm run incident:readiness<br />
                /api/admin/incident-response-readiness
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Flame className="h-6 w-6 text-rose-700" />
              <CardTitle>Emergency stop triggers</CardTitle>
              <CardDescription>Use these to pause launch traffic, rollback or disable a risky feature.</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="grid gap-2 text-sm leading-6 text-slate-700">
                {report.emergencyStop.stopTriggers.map((item) => <li key={item} className="flex gap-2"><AlertTriangle className="mt-1 h-4 w-4 shrink-0 text-rose-600" />{item}</li>)}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <Clock3 className="h-6 w-6 text-emerald-700" />
          <CardTitle>Severity response map</CardTitle>
          <CardDescription>Clear response targets prevent confusion during real launch incidents.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {report.severityLanes.map((lane) => (
              <div key={lane.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded-full border px-2 py-0.5 text-[10px] font-black ${priorityClass(lane.priority)}`}>{lane.priority}</span>
                  <p className="font-black text-slate-950">{lane.label}</p>
                </div>
                <p className="mt-2 rounded-xl bg-slate-50 p-3 text-sm font-bold leading-6 text-slate-800">{lane.responseTarget}</p>
                <div className="mt-3 grid gap-3">
                  <div>
                    <p className="text-xs font-black uppercase tracking-wide text-slate-500">Examples</p>
                    <ul className="mt-2 grid gap-1.5 text-sm text-slate-700">
                      {lane.examples.map((example) => <li key={example} className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />{example}</li>)}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-wide text-slate-500">Required actions</p>
                    <ul className="mt-2 grid gap-1.5 text-sm text-slate-700">
                      {lane.requiredActions.map((action) => <li key={action} className="flex gap-2"><ListChecks className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />{action}</li>)}
                    </ul>
                  </div>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-700"><strong>Launch risk:</strong> {lane.launchRisk}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <RotateCcw className="h-6 w-6 text-emerald-700" />
            <CardTitle>First-hour checklist</CardTitle>
            <CardDescription>Use this when something breaks during launch.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="grid gap-2 text-sm leading-6 text-slate-700">
              {report.emergencyStop.firstHourChecklist.map((item) => <li key={item} className="flex gap-2"><PhoneCall className="mt-1 h-4 w-4 shrink-0 text-emerald-700" />{item}</li>)}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <LifeBuoy className="h-6 w-6 text-emerald-700" />
            <CardTitle>Incident runbook</CardTitle>
            <CardDescription>Save this evidence for SEV0-SEV2 issues and launch rollback reviews.</CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="grid list-decimal gap-2 pl-5 text-sm text-slate-700">
              {report.runbook.map((item) => <li key={item.step} className="pl-1 leading-6"><strong>{item.owner}:</strong> {item.step} <span className="text-slate-500">Evidence: {item.evidence}</span></li>)}
            </ol>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <FileCheck2 className="h-6 w-6 text-emerald-700" />
          <CardTitle>Evidence to save</CardTitle>
          <CardDescription>Minimum launch proof before calling incident response ready.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {[
              'Test alert screenshot or incident email proof',
              'Rollback drill screenshot with production/staging route proof',
              'Status update/support macro screenshot',
              'Masked incident evidence folder sample'
            ].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-white p-4 text-sm font-bold leading-6 text-slate-700">{item}</div>)}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
