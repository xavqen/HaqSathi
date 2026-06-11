import { AlertTriangle, CheckCircle2, FileCheck2, KeyRound, ListChecks, LockKeyhole, PackageCheck, RefreshCcw, Scale, ShieldCheck } from 'lucide-react'
import { requireAdmin } from '@/lib/auth/session'
import { getDependencyReadinessReport, type DependencyReadinessPriority, type DependencyReadinessStatus } from '@/lib/security/dependency-readiness'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

function statusClass(status: DependencyReadinessStatus) {
  if (status === 'PASS') return 'border-emerald-200 bg-emerald-50 text-emerald-800'
  if (status === 'READY_TO_TEST') return 'border-blue-200 bg-blue-50 text-blue-800'
  if (status === 'MANUAL_REQUIRED') return 'border-amber-200 bg-amber-50 text-amber-800'
  return 'border-rose-200 bg-rose-50 text-rose-800'
}

function priorityClass(priority: DependencyReadinessPriority) {
  if (priority === 'P0') return 'border-rose-200 bg-rose-50 text-rose-800'
  if (priority === 'P1') return 'border-amber-200 bg-amber-50 text-amber-800'
  return 'border-slate-200 bg-slate-50 text-slate-700'
}

export default async function DependencyReadinessPage() {
  await requireAdmin()
  const report = getDependencyReadinessReport()

  return (
    <div className="grid gap-6">
      <section className="rounded-[2rem] border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-white p-5 shadow-soft sm:p-7">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <Badge>Phase 77</Badge>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Dependency security readiness</h1>
            <p className="mt-3 text-sm leading-6 text-slate-700 sm:text-base">
              Launch guard for npm audit, lockfile drift, high/critical vulnerability triage, open-source license review, package overrides and Vercel clean-install proof.
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
            <CardDescription>Risk lanes</CardDescription>
            <CardTitle className="text-3xl text-slate-950">{report.summary.riskLanes}</CardTitle>
          </CardHeader>
        </Card>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
        <Card>
          <CardHeader>
            <PackageCheck className="h-6 w-6 text-emerald-700" />
            <CardTitle>Dependency launch controls</CardTitle>
            <CardDescription>Keep dependency bumps and risky packages under manual review until audit, license and CI evidence is saved.</CardDescription>
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
              <CardDescription>Generate local evidence and review protected API output.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-2xl bg-slate-950 p-4 font-mono text-xs font-bold leading-6 text-emerald-100">
                npm run dependency:readiness<br />
                /api/admin/dependency-readiness
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <LockKeyhole className="h-6 w-6 text-amber-700" />
              <CardTitle>Safe default</CardTitle>
              <CardDescription>Use this before any major dependency bump, public traffic or payment launch.</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="grid gap-2 text-sm leading-6 text-slate-700">
                <li className="flex gap-2"><KeyRound className="mt-1 h-4 w-4 shrink-0 text-emerald-700" />Keep lockfile changes small and review package diffs before deploy.</li>
                <li className="flex gap-2"><RefreshCcw className="mt-1 h-4 w-4 shrink-0 text-emerald-700" />Run clean install, typecheck, build and quality release after dependency changes.</li>
                <li className="flex gap-2"><AlertTriangle className="mt-1 h-4 w-4 shrink-0 text-rose-600" />Do not ship high/critical runtime advisories without founder/security approval.</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <Scale className="h-6 w-6 text-emerald-700" />
          <CardTitle>Risk lane map</CardTitle>
          <CardDescription>Dependency areas that need evidence before public launch or any major package upgrade.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {report.riskLanes.map((item) => (
              <div key={item.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded-full border px-2 py-0.5 text-[10px] font-black ${priorityClass(item.priority)}`}>{item.priority}</span>
                  <p className="font-black text-slate-950">{item.label}</p>
                </div>
                <p className="mt-2 break-words rounded-xl bg-slate-50 p-3 font-mono text-xs font-semibold leading-6 text-slate-800">{item.scope.join(', ')}</p>
                <ul className="mt-3 grid gap-1.5 text-sm text-slate-700">
                  {item.checks.map((check) => <li key={check} className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />{check}</li>)}
                </ul>
                <p className="mt-3 text-sm leading-6 text-slate-700"><strong>Launch risk:</strong> {item.launchRisk}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <ListChecks className="h-6 w-6 text-emerald-700" />
            <CardTitle>Runbook</CardTitle>
            <CardDescription>Use this before updating runtime, auth, Prisma, PDF, upload or testing dependencies.</CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="grid list-decimal gap-2 pl-5 text-sm text-slate-700">
              {report.runbook.map((item) => <li key={item.step} className="pl-1 leading-6"><strong>{item.owner}:</strong> {item.step} <span className="text-slate-500">Evidence: {item.evidence}</span></li>)}
            </ol>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <FileCheck2 className="h-6 w-6 text-emerald-700" />
            <CardTitle>Evidence to save</CardTitle>
            <CardDescription>Attach these proofs to the launch command center.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="grid gap-2 text-sm text-slate-700">
              <li className="flex gap-2"><PackageCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />Dependency readiness JSON/CSV from local evidence generator.</li>
              <li className="flex gap-2"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />npm audit/advisory report with high/critical triage notes.</li>
              <li className="flex gap-2"><Scale className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />License inventory and restricted-license review notes.</li>
              <li className="flex gap-2"><RefreshCcw className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />Vercel clean install/build proof after package-lock changes.</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
