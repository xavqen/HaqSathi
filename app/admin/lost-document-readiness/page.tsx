import { FileWarning, ShieldAlert } from 'lucide-react'
import { AdminShell } from '@/components/admin/admin-shell'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getLostDocumentReadinessReport } from '@/lib/productivity/lost-document-readiness'

function statusClass(status: string) {
  if (status === 'PASS') return 'border-emerald-200 bg-emerald-50 text-emerald-800'
  if (status === 'READY_TO_TEST') return 'border-blue-200 bg-blue-50 text-blue-800'
  if (status === 'BLOCKED') return 'border-red-200 bg-red-50 text-red-800'
  return 'border-amber-200 bg-amber-50 text-amber-800'
}

function priorityClass(priority: string) {
  if (priority === 'P0') return 'border-red-200 bg-red-50 text-red-800'
  if (priority === 'P1') return 'border-amber-200 bg-amber-50 text-amber-800'
  return 'border-slate-200 bg-slate-50 text-slate-700'
}

export default function LostDocumentReadinessPage() {
  const report = getLostDocumentReadinessReport()

  return (
    <AdminShell>
      <div className="space-y-6">
        <div className="rounded-[2rem] border border-emerald-100 bg-white p-6 shadow-soft">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm font-black text-emerald-800"><FileWarning className="h-5 w-5" /> Phase 109</div>
              <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">Lost document report readiness</h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">Readiness controls for lost Aadhaar, PAN, passport, DL, bank card, SIM, phone and certificate report/reissue planning.</p>
            </div>
            <div className={`rounded-full border px-4 py-2 text-xs font-black ${statusClass(report.summary.status)}`}>{report.summary.status}</div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card><CardHeader><CardTitle>{report.summary.totalControls}</CardTitle><CardDescription>Total controls</CardDescription></CardHeader></Card>
          <Card><CardHeader><CardTitle>{report.summary.ready}</CardTitle><CardDescription>Ready/pass</CardDescription></CardHeader></Card>
          <Card><CardHeader><CardTitle>{report.summary.manualRequired}</CardTitle><CardDescription>Manual review</CardDescription></CardHeader></Card>
          <Card><CardHeader><CardTitle>{report.summary.blocked}</CardTitle><CardDescription>Blocked</CardDescription></CardHeader></Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Readiness controls</CardTitle>
            <CardDescription>API: /api/admin/lost-document-readiness · Evidence: npm run lost-document:readiness</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {report.controls.map((control) => (
                <div key={control.id} className="rounded-2xl border border-slate-200 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="font-black text-slate-950">{control.label}</div>
                    <div className="flex flex-wrap gap-2">
                      <span className={`rounded-full border px-2 py-0.5 text-[10px] font-black ${priorityClass(control.priority)}`}>{control.priority}</span>
                      <span className={`rounded-full border px-2 py-0.5 text-[10px] font-black ${statusClass(control.status)}`}>{control.status}</span>
                    </div>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{control.note}</p>
                  <code className="mt-2 inline-block rounded-lg bg-slate-100 px-2 py-1 text-xs text-slate-700">{control.envValue}</code>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><ShieldAlert className="h-5 w-5 text-amber-600" /> Safety lanes</CardTitle>
            <CardDescription>Review before enabling this lost-document workflow at scale.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2">
              {report.lostDocumentReadinessLanes.map((lane) => (
                <div key={lane.id} className="rounded-2xl border border-slate-200 p-4">
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
