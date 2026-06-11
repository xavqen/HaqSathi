import { Activity, AlertTriangle, CheckCircle2, Clock3, ExternalLink, ShieldCheck } from 'lucide-react'
import { requireAdmin } from '@/lib/auth/session'
import { getStatusTrackingReadinessReport } from '@/lib/status-tracking-readiness'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Status Tracking | Admin | HaqSathi AI' }

function statusClass(status: string) {
  if (status === 'PASS' || status === 'READY_TO_TEST') return 'border-emerald-200 bg-emerald-50 text-emerald-800'
  if (status === 'BLOCKED') return 'border-rose-200 bg-rose-50 text-rose-800'
  return 'border-amber-200 bg-amber-50 text-amber-800'
}

export default async function AdminStatusTrackingPage() {
  await requireAdmin()
  const report = getStatusTrackingReadinessReport()
  const cards = [
    { label: 'Ready controls', value: report.summary.ready, note: `${report.summary.totalControls} total controls`, icon: CheckCircle2 },
    { label: 'Manual review', value: report.summary.manualRequired, note: 'Needs owner/evidence', icon: AlertTriangle },
    { label: 'Blocked', value: report.summary.blocked, note: 'Must be zero', icon: ShieldCheck },
    { label: 'Portal categories', value: report.portals.length, note: 'Safe tracking maps', icon: Activity }
  ]

  return (
    <div className="space-y-6">
      <div className="rounded-[1.75rem] border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-white p-5 shadow-soft sm:p-7">
        <Badge className="border-emerald-200 bg-emerald-100 text-emerald-800">Phase 58</Badge>
        <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Application status tracking readiness</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">Prepare safe complaint, UPI, cyber, bank, service and scheme status tracking without asking users for OTPs, passwords or private portal secrets.</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <a href="/api/admin/status-tracking-readiness" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border bg-white px-4 py-2 text-sm font-black text-slate-700 shadow-sm"><ExternalLink className="h-4 w-4" />Open API</a>
            <a href="/dashboard/status-tracker" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-black text-primary-foreground shadow-sm"><Clock3 className="h-4 w-4" />User tracker</a>
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
          <Activity className="h-6 w-6 text-emerald-700" />
          <CardTitle>Status tracking controls</CardTitle>
          <CardDescription>These checks keep status tracking useful without unsafe scraping, fake status claims or private-data leaks.</CardDescription>
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
          <CardTitle>Safe portal category map</CardTitle>
          <CardDescription>Track references, visible status and next action only. Never collect login secrets.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 lg:grid-cols-2">
            {report.portals.map((portal) => (
              <div key={portal.id} className="rounded-2xl border bg-slate-50 p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm font-black text-slate-950">{portal.label}</p>
                    <p className="mt-1 text-xs font-bold uppercase tracking-wide text-emerald-700">{portal.category}</p>
                  </div>
                  <Badge className="w-fit">{portal.id}</Badge>
                </div>
                <div className="mt-3 grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
                  <div>
                    <p className="font-black text-slate-900">Reference examples</p>
                    <ul className="mt-2 grid gap-1">{portal.referenceExamples.map((item) => <li key={item}>• {item}</li>)}</ul>
                  </div>
                  <div>
                    <p className="font-black text-slate-900">Never ask for</p>
                    <ul className="mt-2 grid gap-1 text-rose-700">{portal.neverAskFor.map((item) => <li key={item}>• {item}</li>)}</ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Privacy rules</CardTitle>
            <CardDescription>Mandatory rules for status screenshots, alerts and admin notes.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="grid gap-3 text-sm text-slate-700">
              {report.privacyRules.map((item) => <li key={item} className="flex gap-2"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />{item}</li>)}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Minimum launch evidence</CardTitle>
            <CardDescription>Proof needed before calling this feature production-ready.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="grid gap-3 text-sm text-slate-700">
              {report.launchEvidence.map((item) => <li key={item} className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />{item}</li>)}
            </ul>
            <pre className="mt-5 overflow-x-auto rounded-xl bg-slate-950 p-3 text-xs font-bold text-emerald-100">npm run status-tracking:readiness</pre>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
