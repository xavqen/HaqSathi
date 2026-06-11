import { AlertTriangle, CheckCircle2, FileKey2, KeyRound, ListChecks, LockKeyhole, RefreshCcw, ShieldCheck, Siren, TerminalSquare } from 'lucide-react'
import { requireAdmin } from '@/lib/auth/session'
import { getSecretsReadinessReport, type SecretsReadinessPriority, type SecretsReadinessStatus } from '@/lib/security/secrets-readiness'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

function statusClass(status: SecretsReadinessStatus) {
  if (status === 'PASS') return 'border-emerald-200 bg-emerald-50 text-emerald-800'
  if (status === 'READY_TO_TEST') return 'border-blue-200 bg-blue-50 text-blue-800'
  if (status === 'MANUAL_REQUIRED') return 'border-amber-200 bg-amber-50 text-amber-800'
  return 'border-rose-200 bg-rose-50 text-rose-800'
}

function priorityClass(priority: SecretsReadinessPriority) {
  if (priority === 'P0') return 'border-rose-200 bg-rose-50 text-rose-800'
  if (priority === 'P1') return 'border-amber-200 bg-amber-50 text-amber-800'
  return 'border-slate-200 bg-slate-50 text-slate-700'
}

export default async function SecretsReadinessPage() {
  await requireAdmin()
  const report = getSecretsReadinessReport()

  return (
    <div className="grid gap-6">
      <section className="rounded-[2rem] border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-white p-5 shadow-soft sm:p-7">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <Badge>Phase 80</Badge>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Secrets rotation readiness</h1>
            <p className="mt-3 text-sm leading-6 text-slate-700 sm:text-base">
              Launch guard for auth secrets, database/service keys, payment webhooks, email providers, cron tokens, alert webhooks and the NEXT_PUBLIC boundary.
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
            <FileKey2 className="h-6 w-6 text-emerald-700" />
            <CardTitle>Secret controls</CardTitle>
            <CardDescription>Do not publish test traffic until P0 auth, database, payment, cron and public-env boundaries are reviewed.</CardDescription>
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
              <CardDescription>Generate local evidence and review protected admin output.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-2xl bg-slate-950 p-4 font-mono text-xs font-bold leading-6 text-emerald-100">
                npm run secrets:readiness<br />
                /api/admin/secrets-readiness
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <LockKeyhole className="h-6 w-6 text-amber-700" />
              <CardTitle>Safe default</CardTitle>
              <CardDescription>Never reveal or paste real secrets in screenshots, tickets, analytics or AI prompts.</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="grid gap-2 text-sm leading-6 text-slate-700">
                <li className="flex gap-2"><KeyRound className="mt-1 h-4 w-4 shrink-0 text-emerald-700" />Keep all private provider keys server-only and never under NEXT_PUBLIC.</li>
                <li className="flex gap-2"><RefreshCcw className="mt-1 h-4 w-4 shrink-0 text-emerald-700" />Rotate test/live keys separately and save masked evidence after every rotation.</li>
                <li className="flex gap-2"><AlertTriangle className="mt-1 h-4 w-4 shrink-0 text-rose-600" />Block public launch if auth/session secret is weak, missing or placeholder.</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <ShieldCheck className="h-6 w-6 text-emerald-700" />
          <CardTitle>Secret lanes</CardTitle>
          <CardDescription>High-risk secrets that need owner, rotation cadence, leak-response plan and masked evidence.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {report.secretLanes.map((lane) => (
              <div key={lane.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded-full border px-2 py-0.5 text-[10px] font-black ${priorityClass(lane.priority)}`}>{lane.priority}</span>
                  <p className="font-black text-slate-950">{lane.label}</p>
                </div>
                <p className="mt-2 break-words rounded-xl bg-slate-50 p-3 font-mono text-xs font-semibold leading-6 text-slate-800">{lane.secrets.join(', ')}</p>
                <p className="mt-3 text-sm leading-6 text-slate-700"><strong>Owner:</strong> {lane.owner}</p>
                <p className="mt-2 text-sm leading-6 text-slate-700"><strong>Rotation:</strong> {lane.rotationCadence}</p>
                <p className="mt-2 text-sm leading-6 text-slate-700"><strong>Risk:</strong> {lane.leakRisk}</p>
                <p className="mt-2 text-sm leading-6 text-slate-700"><strong>Evidence:</strong> {lane.verification}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <ListChecks className="h-6 w-6 text-emerald-700" />
            <CardTitle>Rotation runbook</CardTitle>
            <CardDescription>Use this when rotating auth, DB, payment, email, cron or alert secrets.</CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="grid list-decimal gap-2 pl-5 text-sm text-slate-700">
              {report.rotationRunbook.map((item) => <li key={item.step} className="pl-1 leading-6"><strong>{item.owner}:</strong> {item.step} — {item.action}</li>)}
            </ol>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Siren className="h-6 w-6 text-rose-600" />
            <CardTitle>Leak response</CardTitle>
            <CardDescription>Follow this immediately if a token appears in logs, Git, screenshots or chat.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="grid gap-2 text-sm text-slate-700">
              {report.leakResponse.map((item) => <li key={item} className="flex gap-2"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />{item}</li>)}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CheckCircle2 className="h-6 w-6 text-emerald-700" />
            <CardTitle>Public env rules</CardTitle>
            <CardDescription>Review before every deploy and when adding any env variable.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="grid gap-2 text-sm text-slate-700">
              {report.publicEnvRules.map((item) => <li key={item} className="flex gap-2"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />{item}</li>)}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
