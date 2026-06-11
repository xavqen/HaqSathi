import { ClipboardList, CheckCircle2, FileWarning, ShieldCheck, TerminalSquare } from 'lucide-react'
import { AdminShell } from '@/components/admin/admin-shell'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getCallVisitLogbookReadinessReport, type CallLogbookReadinessPriority, type CallLogbookReadinessStatus } from '@/lib/productivity/call-visit-logbook-readiness'

export const metadata = { title: 'Call Logbook Readiness | Admin' }
export const dynamic = 'force-dynamic'

function statusClass(status: CallLogbookReadinessStatus) {
  if (status === 'PASS') return 'border-emerald-200 bg-emerald-50 text-emerald-800'
  if (status === 'READY_TO_TEST') return 'border-blue-200 bg-blue-50 text-blue-800'
  if (status === 'BLOCKED') return 'border-rose-200 bg-rose-50 text-rose-800'
  return 'border-amber-200 bg-amber-50 text-amber-800'
}

function priorityClass(priority: CallLogbookReadinessPriority) {
  if (priority === 'P0') return 'border-rose-200 bg-rose-50 text-rose-800'
  if (priority === 'P1') return 'border-amber-200 bg-amber-50 text-amber-800'
  return 'border-slate-200 bg-slate-50 text-slate-700'
}

export default function CallLogbookReadinessAdminPage() {
  const report = getCallVisitLogbookReadinessReport()
  return (
    <AdminShell>
      <div className="grid gap-6">
        <div className="rounded-[2rem] border border-emerald-100 bg-white p-6 shadow-soft sm:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm font-black text-emerald-800"><ClipboardList className="h-5 w-5" /> Phase 91</div>
              <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Call & visit logbook readiness</h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
                Review call, office visit, service center and bank branch logbook safety before promoting it for real complaint escalation.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm shadow-sm">
              <p className="font-black text-slate-950">Mode: {report.mode}</p>
              <p className="mt-1 text-slate-600">Ready {report.summary.ready} / {report.summary.totalControls} · Manual {report.summary.manualRequired} · Blocked {report.summary.blocked}</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <Card>
            <CardHeader>
              <ShieldCheck className="h-6 w-6 text-emerald-700" />
              <CardTitle>Launch controls</CardTitle>
              <CardDescription>Privacy warning, mobile UX, copy/export safety and escalation tone review gates.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {report.controls.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-full border px-2 py-0.5 text-[10px] font-black ${priorityClass(item.priority)}`}>{item.priority}</span>
                      <span className={`rounded-full border px-2 py-0.5 text-[10px] font-black ${statusClass(item.status)}`}>{item.status}</span>
                    </div>
                    <h2 className="mt-2 font-black text-slate-950">{item.label}</h2>
                    <p className="mt-1 break-words font-mono text-xs text-slate-500">{item.envValue}</p>
                    <div className="mt-3 grid gap-3 lg:grid-cols-3">
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
                <TerminalSquare className="h-6 w-6 text-emerald-700" />
                <CardTitle>Command</CardTitle>
                <CardDescription>Generate local evidence and review the protected API.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-2xl bg-slate-950 p-4 font-mono text-xs font-bold leading-6 text-emerald-100">
                  npm run call-logbook:readiness<br />
                  /api/admin/call-logbook-readiness<br />
                  /tools/call-visit-logbook
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <FileWarning className="h-6 w-6 text-emerald-700" />
                <CardTitle>Safety policy</CardTitle>
                <CardDescription>Rules for interaction logs and follow-up messages.</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="grid gap-2 text-sm leading-6 text-slate-700">
                  {report.safetyPolicy.map((item) => <li key={item} className="flex gap-2"><CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-700" />{item}</li>)}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card>
          <CardHeader>
            <ClipboardList className="h-6 w-6 text-emerald-700" />
            <CardTitle>Interaction lanes</CardTitle>
            <CardDescription>Priority lanes and safety rules for the logbook.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {report.callLogbookReadinessLanes.map((lane) => (
                <div key={lane.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                  <span className={`rounded-full border px-2 py-0.5 text-[10px] font-black ${priorityClass(lane.priority)}`}>{lane.priority}</span>
                  <h2 className="mt-3 font-black text-slate-950">{lane.lane}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-700"><strong>Capture:</strong> {lane.captureRule}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-700"><strong>Safety:</strong> {lane.safetyRule}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  )
}
