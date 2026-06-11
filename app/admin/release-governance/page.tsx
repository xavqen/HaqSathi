import { AlertTriangle, CheckCircle2, GitBranch, History, ListChecks, PackageCheck, Rocket, RotateCcw, ShieldCheck, TerminalSquare } from 'lucide-react'
import { requireAdmin } from '@/lib/auth/session'
import { getReleaseGovernanceReadinessReport, type ReleaseGovernancePriority, type ReleaseGovernanceStatus } from '@/lib/operations/release-governance-readiness'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

function statusClass(status: ReleaseGovernanceStatus) {
  if (status === 'PASS') return 'border-emerald-200 bg-emerald-50 text-emerald-800'
  if (status === 'READY_TO_TEST') return 'border-blue-200 bg-blue-50 text-blue-800'
  if (status === 'MANUAL_REQUIRED') return 'border-amber-200 bg-amber-50 text-amber-800'
  return 'border-rose-200 bg-rose-50 text-rose-800'
}

function priorityClass(priority: ReleaseGovernancePriority) {
  if (priority === 'P0') return 'border-rose-200 bg-rose-50 text-rose-800'
  if (priority === 'P1') return 'border-amber-200 bg-amber-50 text-amber-800'
  return 'border-slate-200 bg-slate-50 text-slate-700'
}

export default async function ReleaseGovernancePage() {
  await requireAdmin()
  const report = getReleaseGovernanceReadinessReport()

  return (
    <div className="grid gap-6">
      <section className="rounded-[2rem] border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-white p-5 shadow-soft sm:p-7">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <Badge>Phase 82</Badge>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Release governance &amp; rollback readiness</h1>
            <p className="mt-3 text-sm leading-6 text-slate-700 sm:text-base">
              Keep every zip, deployment, release note, go/no-go decision and rollback target traceable before public launch or high-traffic promotion.
            </p>
          </div>
          <div className="rounded-2xl border border-emerald-100 bg-white p-4 text-sm shadow-sm lg:min-w-[18rem]">
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
            <CardDescription>Blocked</CardDescription>
            <CardTitle className="text-3xl text-rose-700">{report.summary.blocked}</CardTitle>
          </CardHeader>
        </Card>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
        <Card>
          <CardHeader>
            <PackageCheck className="h-6 w-6 text-emerald-700" />
            <CardTitle>Release controls</CardTitle>
            <CardDescription>Use these controls before every zip handoff, Vercel deployment or public launch push.</CardDescription>
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
              <TerminalSquare className="h-6 w-6 text-emerald-700" />
              <CardTitle>Command</CardTitle>
              <CardDescription>Generate local evidence and review the protected admin API.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-2xl bg-slate-950 p-4 font-mono text-xs font-bold leading-6 text-emerald-100">
                npm run release-governance:readiness<br />
                /api/admin/release-governance-readiness
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <RotateCcw className="h-6 w-6 text-rose-600" />
              <CardTitle>Rollback rule</CardTitle>
              <CardDescription>Rollback must be ready before launch, not discovered during an incident.</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="grid gap-2 text-sm leading-6 text-slate-700">
                <li className="flex gap-2"><ShieldCheck className="mt-1 h-4 w-4 shrink-0 text-emerald-700" />Keep the previous known-good zip or Vercel deployment available until the watch window passes.</li>
                <li className="flex gap-2"><AlertTriangle className="mt-1 h-4 w-4 shrink-0 text-rose-600" />Never increase traffic before P0 rollback, feature flags and incident owner evidence are saved.</li>
                <li className="flex gap-2"><Rocket className="mt-1 h-4 w-4 shrink-0 text-emerald-700" />Re-release gradually only after quality gates and monitoring evidence pass again.</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <GitBranch className="h-6 w-6 text-emerald-700" />
          <CardTitle>Release lanes</CardTitle>
          <CardDescription>Traceability lanes that make every deployment reversible and reviewable.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {report.releaseLanes.map((lane) => (
              <div key={lane.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded-full border px-2 py-0.5 text-[10px] font-black ${priorityClass(lane.priority)}`}>{lane.priority}</span>
                  <p className="font-black text-slate-950">{lane.label}</p>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-700"><strong>Owner:</strong> {lane.owner}</p>
                <p className="mt-2 text-sm leading-6 text-slate-700"><strong>Artifact:</strong> {lane.artifact}</p>
                <p className="mt-2 text-sm leading-6 text-slate-700"><strong>Review:</strong> {lane.reviewRule}</p>
                <p className="mt-2 text-sm leading-6 text-slate-700"><strong>Rollback:</strong> {lane.rollbackRule}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <ListChecks className="h-6 w-6 text-emerald-700" />
            <CardTitle>Release checklist</CardTitle>
            <CardDescription>Run this before moving from testing to public launch.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="grid gap-2 text-sm text-slate-700">
              {report.releaseChecklist.map((item) => <li key={item} className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />{item}</li>)}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <History className="h-6 w-6 text-amber-700" />
            <CardTitle>Rollback playbook</CardTitle>
            <CardDescription>Use this if a release breaks login, payments, AI, vault, admin or mobile flows.</CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="grid list-decimal gap-2 pl-5 text-sm leading-6 text-slate-700">
              {report.rollbackPlaybook.map((item) => <li key={item}>{item}</li>)}
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
