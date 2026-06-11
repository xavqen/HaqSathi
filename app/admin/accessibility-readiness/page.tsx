import { Accessibility, AlertTriangle, CheckCircle2, Eye, FileCheck2, Keyboard, ListChecks, MousePointerClick, Route, ShieldCheck, Smartphone } from 'lucide-react'
import { requireAdmin } from '@/lib/auth/session'
import { getAccessibilityReadinessReport } from '@/lib/accessibility/readiness'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Accessibility Readiness | Admin | HaqSathi AI' }

function statusClass(status: string) {
  if (status === 'PASS' || status === 'READY_TO_TEST') return 'border-emerald-200 bg-emerald-50 text-emerald-800'
  if (status === 'BLOCKED') return 'border-rose-200 bg-rose-50 text-rose-800'
  return 'border-amber-200 bg-amber-50 text-amber-800'
}

function priorityClass(priority: string) {
  if (priority === 'P0') return 'border-rose-200 bg-rose-50 text-rose-800'
  if (priority === 'P1') return 'border-amber-200 bg-amber-50 text-amber-800'
  return 'border-slate-200 bg-slate-50 text-slate-700'
}

export default async function AccessibilityReadinessPage() {
  await requireAdmin()
  const report = getAccessibilityReadinessReport()

  return (
    <div className="grid gap-6">
      <section className="rounded-[2rem] border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-white p-5 shadow-soft sm:p-7">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <Badge>Phase 71</Badge>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Accessibility readiness</h1>
            <p className="mt-3 text-sm leading-6 text-slate-700 sm:text-base">
              Launch guard for keyboard navigation, focus states, readable forms, contrast, screen-reader semantics and assistive-technology smoke testing.
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

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.7fr)]">
        <Card>
          <CardHeader>
            <Accessibility className="h-6 w-6 text-emerald-700" />
            <CardTitle>Launch accessibility controls</CardTitle>
            <CardDescription>Use this as the minimum accessibility signoff matrix before public launch.</CardDescription>
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
              <Keyboard className="h-6 w-6 text-emerald-700" />
              <CardTitle>Command</CardTitle>
              <CardDescription>Generate local evidence files and review API output.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-2xl bg-slate-950 p-4 font-mono text-xs font-bold leading-6 text-emerald-100">
                npm run accessibility:readiness<br />
                /api/admin/accessibility-readiness
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <ShieldCheck className="h-6 w-6 text-emerald-700" />
              <CardTitle>Assistive tech matrix</CardTitle>
              <CardDescription>Smoke test targets for launch readiness.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {report.assistiveTechMatrix.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-full border px-2 py-0.5 text-[10px] font-black ${priorityClass(item.priority)}`}>{item.priority}</span>
                      <p className="font-black text-slate-950">{item.label}</p>
                    </div>
                    <ul className="mt-2 grid gap-1 text-sm text-slate-700">
                      {item.checks.map((check) => <li key={check} className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />{check}</li>)}
                    </ul>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <Route className="h-6 w-6 text-emerald-700" />
          <CardTitle>Route checklist</CardTitle>
          <CardDescription>Minimum routes where keyboard, focus, contrast and forms should be checked.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {report.routeChecks.map((item) => (
              <div key={item.route} className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded-full border px-2 py-0.5 text-[10px] font-black ${priorityClass(item.priority)}`}>{item.priority}</span>
                  <p className="font-mono text-sm font-black text-slate-950">{item.route}</p>
                </div>
                <ul className="mt-3 grid gap-1.5 text-sm text-slate-700">
                  {item.checks.slice(0, 4).map((check) => <li key={check} className="flex gap-2"><Eye className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />{check}</li>)}
                </ul>
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
            <CardDescription>Follow after navbar, global CSS, form, dropdown or page-layout changes.</CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="grid list-decimal gap-2 pl-5 text-sm text-slate-700">
              {report.runbook.map((item) => <li key={item} className="pl-1 leading-6">{item}</li>)}
            </ol>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <FileCheck2 className="h-6 w-6 text-emerald-700" />
            <CardTitle>Evidence to save</CardTitle>
            <CardDescription>Keep these proofs with the launch command center evidence.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="grid gap-2 text-sm text-slate-700">
              <li className="flex gap-2"><MousePointerClick className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />Keyboard walkthrough recording for P0 routes.</li>
              <li className="flex gap-2"><Smartphone className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />Mobile focus/form screenshots for complaint, UPI and dashboard flows.</li>
              <li className="flex gap-2"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />Contrast and warning/banner screenshots.</li>
              <li className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />Lighthouse or axe accessibility report from deployed URL.</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
