import { AlertTriangle, CalendarClock, CheckCircle2, ShieldCheck } from 'lucide-react'
import { AdminShell } from '@/components/admin/admin-shell'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getDeadlineAppealReadinessReport } from '@/lib/productivity/deadline-appeal-readiness'

export const metadata = {
  title: 'Deadline Appeal Readiness | Admin | HaqSathi AI'
}

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

export default function DeadlineAppealReadinessPage() {
  const report = getDeadlineAppealReadinessReport()

  return (
    <AdminShell>
      <div className="grid gap-6">
        <Card className="border-emerald-100">
          <CardHeader>
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="flex items-center gap-2 text-sm font-black text-emerald-800"><CalendarClock className="h-5 w-5" /> Phase 93</div>
                <CardTitle className="text-3xl">Deadline appeal readiness</CardTitle>
                <CardDescription>Launch checks for the deadline/appeal planner tool, guidance-only copy, proof checklist and mobile flow.</CardDescription>
              </div>
              <div className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-black text-white">/api/admin/deadline-appeal-readiness</div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><p className="text-xs font-black uppercase text-slate-500">Controls</p><p className="mt-1 text-2xl font-black text-slate-950">{report.summary.totalControls}</p></div>
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4"><p className="text-xs font-black uppercase text-emerald-700">Ready</p><p className="mt-1 text-2xl font-black text-emerald-950">{report.summary.ready}</p></div>
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4"><p className="text-xs font-black uppercase text-amber-700">Manual</p><p className="mt-1 text-2xl font-black text-amber-950">{report.summary.manualRequired}</p></div>
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4"><p className="text-xs font-black uppercase text-rose-700">Blocked</p><p className="mt-1 text-2xl font-black text-rose-950">{report.summary.blocked}</p></div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <Card>
            <CardHeader>
              <ShieldCheck className="h-6 w-6 text-emerald-700" />
              <CardTitle>Readiness controls</CardTitle>
              <CardDescription>Set envs, review copy, test mobile, then save launch evidence.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {report.controls.map((control) => (
                  <div key={control.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-full border px-2 py-0.5 text-[10px] font-black ${priorityClass(control.priority)}`}>{control.priority}</span>
                      <span className={`rounded-full border px-2 py-0.5 text-[10px] font-black ${statusClass(control.status)}`}>{control.status}</span>
                    </div>
                    <h2 className="mt-3 font-black text-slate-950">{control.label}</h2>
                    <p className="mt-1 break-words font-mono text-xs text-slate-500">{control.envValue}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{control.note}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <AlertTriangle className="h-6 w-6 text-amber-700" />
              <CardTitle>Safety policy</CardTitle>
              <CardDescription>Rules that must stay visible for deadline and appeal users.</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="grid gap-2 text-sm leading-6 text-slate-700">
                {report.safetyPolicy.map((item) => <li key={item} className="flex gap-2"><CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-700" />{item}</li>)}
              </ul>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CalendarClock className="h-6 w-6 text-emerald-700" />
            <CardTitle>Deadline planner lanes</CardTitle>
            <CardDescription>What should be reviewed before public launch.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {report.deadlineAppealReadinessLanes.map((lane) => (
                <div key={lane.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                  <span className={`rounded-full border px-2 py-0.5 text-[10px] font-black ${priorityClass(lane.priority)}`}>{lane.priority}</span>
                  <h2 className="mt-3 font-black text-slate-950">{lane.lane}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-700"><strong>Review:</strong> {lane.reviewRule}</p>
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
