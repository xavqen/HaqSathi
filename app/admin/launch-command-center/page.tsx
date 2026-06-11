import { AlertTriangle, CheckCircle2, ClipboardList, ExternalLink, FileCheck2, Gauge, Rocket, ShieldAlert, TimerReset } from 'lucide-react'
import { requireAdmin } from '@/lib/auth/session'
import { getLaunchCommandCenterReport } from '@/lib/launch/command-center'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Launch Command Center | Admin | HaqSathi AI' }

function statusClass(status: string) {
  if (status === 'GO') return 'border-emerald-200 bg-emerald-50 text-emerald-800'
  if (status === 'READY_TO_TEST') return 'border-sky-200 bg-sky-50 text-sky-800'
  if (status === 'BLOCKED') return 'border-rose-200 bg-rose-50 text-rose-800'
  return 'border-amber-200 bg-amber-50 text-amber-800'
}

function priorityClass(priority: string) {
  if (priority === 'P0') return 'border-rose-200 bg-rose-50 text-rose-800'
  if (priority === 'P1') return 'border-amber-200 bg-amber-50 text-amber-800'
  return 'border-sky-200 bg-sky-50 text-sky-800'
}

export default async function AdminLaunchCommandCenterPage() {
  await requireAdmin()
  const report = getLaunchCommandCenterReport()
  const cards = [
    { label: 'Launch decision', value: report.decision, note: report.decision === 'GO' ? 'Ready for controlled launch' : 'Evidence still needed', icon: Rocket },
    { label: 'Blocked controls', value: report.summary.blocked + report.summary.evidenceBlocked, note: 'Must be zero', icon: ShieldAlert },
    { label: 'Manual reviews', value: report.summary.manualRequired + report.summary.evidenceManualRequired, note: 'Need owner evidence', icon: FileCheck2 },
    { label: 'Evidence gates', value: report.summary.evidenceGates, note: `${report.evidenceSummary.readyToTest} ready to test`, icon: ClipboardList }
  ]

  return (
    <div className="space-y-6">
      <div className="rounded-[1.75rem] border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-white p-5 shadow-soft sm:p-7">
        <Badge className="border-emerald-200 bg-emerald-100 text-emerald-800">Phase 64</Badge>
        <div className="mt-4 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div className="min-w-0">
            <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Launch command center</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">Single go/no-go view for final launch evidence, owner signoff, rollback ownership, deployment QA, payment, email, storage, official data, AI safety and support readiness.</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <a href="/api/admin/launch-command-center" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border bg-white px-4 py-2 text-sm font-black text-slate-700 shadow-sm"><ExternalLink className="h-4 w-4" />Open API</a>
            <a href="/admin/deployment-qa" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-black text-primary-foreground shadow-sm"><Gauge className="h-4 w-4" />Deployment QA</a>
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
                  <CardTitle className="mt-2 break-words text-2xl font-black sm:text-3xl">{card.value}</CardTitle>
                </div>
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700"><Icon className="h-5 w-5" /></span>
              </CardHeader>
              <CardContent><p className="text-sm font-semibold text-slate-500">{card.note}</p></CardContent>
            </Card>
          )
        })}
      </div>

      <Card className={report.decision === 'BLOCKED' ? 'border-rose-200' : report.decision === 'GO' ? 'border-emerald-200' : 'border-amber-200'}>
        <CardHeader>
          {report.decision === 'GO' ? <CheckCircle2 className="h-6 w-6 text-emerald-700" /> : <AlertTriangle className="h-6 w-6 text-amber-700" />}
          <CardTitle>Current launch decision: {report.decision}</CardTitle>
          <CardDescription>{report.decision === 'GO' ? 'Open traffic gradually and monitor the first 24 hours.' : 'Do not push public traffic until P0/P1 actions and evidence gaps are closed.'}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 lg:grid-cols-2">
            {report.actions.map((action) => (
              <div key={action.id} className="rounded-2xl border bg-white p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-black text-slate-950">{action.title}</p>
                    <p className="mt-1 text-xs font-bold text-slate-500">Owner: {action.owner}</p>
                  </div>
                  <span className={`inline-flex w-fit shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-black ${priorityClass(action.priority)}`}>{action.priority}</span>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-600">{action.nextStep}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <ClipboardList className="h-6 w-6 text-emerald-700" />
          <CardTitle>Go/no-go controls</CardTitle>
          <CardDescription>These controls intentionally stay manual until real launch evidence exists.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 xl:grid-cols-2">
            {report.controls.map((control) => (
              <div key={control.id} className="rounded-2xl border bg-white p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-black text-slate-950">{control.label}</p>
                    <p className="mt-1 break-words text-xs font-semibold text-slate-500">{control.envValue}</p>
                  </div>
                  <span className={`inline-flex w-fit shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-black ${statusClass(control.status)}`}>{control.status}</span>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-600">{control.passCondition}</p>
                <p className="mt-3 rounded-xl bg-slate-50 p-3 text-xs font-semibold leading-5 text-slate-500">Evidence: {control.evidenceRequired}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <TimerReset className="h-6 w-6 text-emerald-700" />
            <CardTitle>Final runbook</CardTitle>
            <CardDescription>Follow this sequence before public launch.</CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="grid list-decimal gap-3 pl-5 text-sm text-slate-700">
              {report.runbook.map((item) => <li key={item} className="pl-1 leading-6">{item}</li>)}
            </ol>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Evidence summary</CardTitle>
            <CardDescription>Aggregated from the launch evidence gate list.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-emerald-50 p-4"><p className="text-xs font-black uppercase text-emerald-700">Pass</p><p className="mt-2 text-2xl font-black text-emerald-900">{report.evidenceSummary.pass}</p></div>
              <div className="rounded-2xl bg-sky-50 p-4"><p className="text-xs font-black uppercase text-sky-700">Ready</p><p className="mt-2 text-2xl font-black text-sky-900">{report.evidenceSummary.readyToTest}</p></div>
              <div className="rounded-2xl bg-amber-50 p-4"><p className="text-xs font-black uppercase text-amber-700">Manual</p><p className="mt-2 text-2xl font-black text-amber-900">{report.evidenceSummary.manualRequired}</p></div>
              <div className="rounded-2xl bg-rose-50 p-4"><p className="text-xs font-black uppercase text-rose-700">Blocked</p><p className="mt-2 text-2xl font-black text-rose-900">{report.evidenceSummary.blocked}</p></div>
            </div>
            <pre className="mt-5 overflow-x-auto rounded-xl bg-slate-950 p-3 text-xs font-bold text-emerald-100">npm run launch:command-center</pre>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
