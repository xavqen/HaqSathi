import { Activity, CheckCircle2, ExternalLink, FileCheck2, Gauge, MonitorSmartphone, Rocket, ShieldAlert } from 'lucide-react'
import { requireAdmin } from '@/lib/auth/session'
import { getDeploymentQaReadinessReport } from '@/lib/deployment/qa-readiness'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Deployment QA Readiness | Admin' }

function statusClass(status: string) {
  if (status === 'PASS' || status === 'READY_TO_TEST') return 'border-emerald-200 bg-emerald-50 text-emerald-800'
  if (status === 'BLOCKED') return 'border-rose-200 bg-rose-50 text-rose-800'
  return 'border-amber-200 bg-amber-50 text-amber-800'
}

function viewportClass(viewport: string) {
  if (viewport === 'mobile') return 'border-emerald-200 bg-emerald-50 text-emerald-800'
  if (viewport === 'tablet') return 'border-sky-200 bg-sky-50 text-sky-800'
  if (viewport === 'desktop') return 'border-indigo-200 bg-indigo-50 text-indigo-800'
  if (viewport === 'api') return 'border-orange-200 bg-orange-50 text-orange-800'
  return 'border-slate-200 bg-slate-50 text-slate-800'
}

export default async function AdminDeploymentQaPage() {
  await requireAdmin()
  const report = getDeploymentQaReadinessReport()
  const cards = [
    { label: 'Ready controls', value: report.summary.ready, note: `${report.summary.totalControls} total checks`, icon: CheckCircle2 },
    { label: 'Manual review', value: report.summary.manualRequired, note: 'Needs saved evidence', icon: FileCheck2 },
    { label: 'Blocked', value: report.summary.blocked, note: 'Must be zero before launch', icon: ShieldAlert },
    { label: 'QA scenarios', value: report.summary.scenarios, note: `${report.summary.criticalScenarios} critical`, icon: MonitorSmartphone }
  ]

  return (
    <div className="space-y-6">
      <div className="rounded-[1.75rem] border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-white p-5 shadow-soft sm:p-7">
        <Badge className="border-emerald-200 bg-emerald-100 text-emerald-800">Phase 63</Badge>
        <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Live deployment QA readiness</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">Production launch gate for Vercel build logs, deployed URL smoke tests, Playwright, Lighthouse, mobile screenshots, cron routes, API health and SEO indexing proof.</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <a href="/api/admin/deployment-qa-readiness" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border bg-white px-4 py-2 text-sm font-black text-slate-700 shadow-sm"><ExternalLink className="h-4 w-4" />Open API</a>
            <a href="/admin/production-qa" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-black text-primary-foreground shadow-sm"><Rocket className="h-4 w-4" />Production QA</a>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <Card key={card.label} className="overflow-hidden">
              <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
                <div className="min-w-0">
                  <CardDescription>{card.label}</CardDescription>
                  <CardTitle className="mt-2 break-words text-3xl font-black">{card.value}</CardTitle>
                </div>
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700"><Icon className="h-5 w-5" /></span>
              </CardHeader>
              <CardContent><p className="text-sm font-semibold text-slate-500">{card.note}</p></CardContent>
            </Card>
          )
        })}
      </div>

      <Card>
        <CardHeader>
          <Gauge className="h-6 w-6 text-emerald-700" />
          <CardTitle>Deployment controls</CardTitle>
          <CardDescription>Mark these only after real Vercel/deployed-domain evidence exists.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 lg:grid-cols-2">
            {report.controls.map((control) => (
              <div key={control.id} className="rounded-2xl border bg-white p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-black text-slate-950">{control.label}</p>
                    <p className="mt-1 break-words text-xs font-semibold text-slate-500">{control.adminValue}</p>
                  </div>
                  <span className={`inline-flex w-fit shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-black ${statusClass(control.status)}`}>{control.status}</span>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-600">{control.userValue}</p>
                <p className="mt-3 rounded-xl bg-slate-50 p-3 text-xs font-semibold leading-5 text-slate-500">{control.launchNote}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <MonitorSmartphone className="h-6 w-6 text-emerald-700" />
          <CardTitle>Real-device QA scenarios</CardTitle>
          <CardDescription>These scenarios catch issues that static audits cannot see.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 xl:grid-cols-2">
            {report.scenarios.map((scenario) => (
              <div key={scenario.id} className="rounded-2xl border bg-slate-50 p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-black text-slate-950">{scenario.label}</p>
                    <p className="mt-1 break-words text-xs font-bold text-slate-500">Path: {scenario.path}</p>
                  </div>
                  <span className={`inline-flex w-fit shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-black uppercase ${viewportClass(scenario.viewport)}`}>{scenario.viewport}</span>
                </div>
                <p className="mt-3 rounded-xl bg-white p-3 text-sm font-semibold leading-6 text-slate-600">{scenario.passCondition}</p>
                <ul className="mt-3 grid gap-2 text-sm text-slate-700">
                  {scenario.evidenceRequired.map((item) => <li key={item} className="flex gap-2"><FileCheck2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />{item}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <Activity className="h-6 w-6 text-emerald-700" />
            <CardTitle>Runbook</CardTitle>
            <CardDescription>Use this order for final launch verification.</CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="grid list-decimal gap-3 pl-5 text-sm text-slate-700">
              {report.runbook.map((item) => <li key={item} className="pl-1 leading-6">{item}</li>)}
            </ol>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Minimum evidence to save</CardTitle>
            <CardDescription>Keep this evidence before sending SEO, ads or public traffic.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="grid gap-3 text-sm text-slate-700">
              {report.evidenceChecklist.map((item) => <li key={item} className="flex gap-2"><FileCheck2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />{item}</li>)}
            </ul>
            <pre className="mt-5 overflow-x-auto rounded-xl bg-slate-950 p-3 text-xs font-bold text-emerald-100">npm run deployment:qa-readiness</pre>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
