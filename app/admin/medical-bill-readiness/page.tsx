import { AlertTriangle, Hospital, ShieldCheck, TerminalSquare } from 'lucide-react'
import { AdminShell } from '@/components/admin/admin-shell'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getMedicalBillReadinessReport } from '@/lib/productivity/medical-bill-readiness'

export const metadata = { title: 'Medical Bill Readiness | Admin' }

function statusClass(status: string) {
  if (status === 'PASS') return 'border-emerald-200 bg-emerald-50 text-emerald-800'
  if (status === 'READY_TO_TEST') return 'border-blue-200 bg-blue-50 text-blue-800'
  if (status === 'BLOCKED') return 'border-red-200 bg-red-50 text-red-800'
  return 'border-amber-200 bg-amber-50 text-amber-800'
}

function priorityClass(priority: string) {
  return priority === 'P0' ? 'border-red-200 bg-red-50 text-red-800' : 'border-slate-200 bg-slate-50 text-slate-700'
}

export default function MedicalBillReadinessPage() {
  const report = getMedicalBillReadinessReport()

  return (
    <AdminShell>
      <div className="space-y-6">
        <div className="rounded-[2rem] border border-emerald-100 bg-white p-6 shadow-soft sm:p-8">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm font-black text-emerald-800"><Hospital className="h-5 w-5" /> Phase 103</div>
              <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-5xl">Medical bill planner readiness</h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">Review billing copy, medical disclaimer, health/payment privacy and mobile QA before public promotion.</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-700">
              <p className="text-slate-950">Mode: {report.mode}</p>
              <p className="mt-1 text-slate-600">Ready {report.summary.ready} / {report.summary.totalControls} · Manual {report.summary.manualRequired} · Blocked {report.summary.blocked}</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <Card>
            <CardHeader>
              <ShieldCheck className="h-6 w-6 text-emerald-700" />
              <CardTitle>Launch controls</CardTitle>
              <CardDescription>Review billing copy, medical disclaimer, privacy and mobile UX.</CardDescription>
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
                    <p className="mt-2 text-sm leading-6 text-slate-700">{item.note}</p>
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
                <CardDescription>Generate local evidence and review protected API output.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-2xl bg-slate-950 p-4 font-mono text-xs font-bold leading-6 text-emerald-100">
                  npm run medical-bill:readiness<br />
                  /api/admin/medical-bill-readiness<br />
                  /tools/medical-bill-dispute-planner
                </div>
              </CardContent>
            </Card>

            <Card className="border-amber-200 bg-amber-50">
              <CardHeader>
                <AlertTriangle className="h-6 w-6 text-amber-700" />
                <CardTitle>Medical safety boundary</CardTitle>
                <CardDescription className="text-amber-900">This feature must remain billing-dispute guidance only. It must not diagnose, treat, interpret medical records or promise insurance/refund outcomes.</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Review lanes</CardTitle>
            <CardDescription>Human review checklist before enabling this planner publicly.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2">
              {report.medicalBillReadinessLanes.map((lane) => (
                <div key={lane.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-black ${priorityClass(lane.priority)}`}>{lane.priority}</span>
                    <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-black text-emerald-800">{lane.lane}</span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{lane.reviewRule}</p>
                  <p className="mt-2 text-xs font-bold leading-5 text-slate-500">Safety: {lane.safetyRule}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  )
}
