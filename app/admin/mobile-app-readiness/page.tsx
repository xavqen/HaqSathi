import { AlertTriangle, CheckCircle2, ExternalLink, ListChecks, Rocket, ShieldCheck, Smartphone } from 'lucide-react'
import { requireAdmin } from '@/lib/auth/session'
import { getMobileAppReadinessReport } from '@/lib/mobile-app/readiness'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Mobile App Readiness | Admin' }

function statusClass(status: string) {
  if (status === 'READY_TO_TEST' || status === 'PASS') return 'border-emerald-200 bg-emerald-50 text-emerald-800'
  if (status === 'BLOCKED') return 'border-rose-200 bg-rose-50 text-rose-800'
  return 'border-amber-200 bg-amber-50 text-amber-800'
}

function priorityClass(priority: string) {
  if (priority === 'P0') return 'border-rose-200 bg-rose-50 text-rose-800'
  if (priority === 'P1') return 'border-amber-200 bg-amber-50 text-amber-800'
  return 'border-sky-200 bg-sky-50 text-sky-800'
}

export default async function AdminMobileAppReadinessPage() {
  await requireAdmin()
  const report = getMobileAppReadinessReport()
  const cards = [
    { label: 'Controls', value: report.summary.totalControls, note: `${report.summary.ready} ready now`, icon: ListChecks },
    { label: 'Manual gates', value: report.summary.manualRequired, note: 'Need store/device proof', icon: AlertTriangle },
    { label: 'Blocked', value: report.summary.blocked, note: 'Must fix before beta', icon: ShieldCheck },
    { label: 'P0 lanes', value: report.summary.p0Lanes, note: 'Store-critical checks', icon: Smartphone }
  ]

  return (
    <div className="space-y-6">
      <div className="rounded-[1.75rem] border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-white p-5 shadow-soft sm:p-7">
        <Badge className="border-emerald-200 bg-emerald-100 text-emerald-800">Phase 69</Badge>
        <div className="mt-4 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div className="min-w-0">
            <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Mobile app readiness</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">PWA-first, Android TWA, Capacitor, Play Store and App Store launch checks in one place. This does not change the web app logic; it only creates the native-app release evidence layer.</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <a href="/api/admin/mobile-app-readiness" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border bg-white px-4 py-2 text-sm font-black text-slate-700 shadow-sm"><ExternalLink className="h-4 w-4" />Open API</a>
            <a href="/admin/pwa-readiness" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-black text-primary-foreground shadow-sm"><Rocket className="h-4 w-4" />PWA QA</a>
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

      <Card>
        <CardHeader>
          <Smartphone className="h-6 w-6 text-emerald-700" />
          <CardTitle>Native app controls</CardTitle>
          <CardDescription>Set review flags only after real Android/iOS or store-console evidence is saved.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 lg:grid-cols-2">
            {report.controls.map((control) => (
              <div key={control.id} className="rounded-2xl border bg-white p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-black text-slate-950">{control.label}</p>
                    <p className="mt-1 break-words text-xs font-semibold text-slate-500">{control.envValue}</p>
                  </div>
                  <span className={`w-fit shrink-0 rounded-full border px-3 py-1 text-[11px] font-black ${statusClass(control.status)}`}>{control.status}</span>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-600">{control.passCondition}</p>
                <p className="mt-2 text-xs font-bold text-slate-500">Evidence: {control.evidenceRequired}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <ListChecks className="h-6 w-6 text-emerald-700" />
          <CardTitle>Device and store lanes</CardTitle>
          <CardDescription>Priority release checks for Android, iOS and store listing readiness.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 xl:grid-cols-2">
            {report.lanes.map((lane) => (
              <div key={lane.id} className="rounded-2xl border bg-slate-50 p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-black text-slate-950">{lane.label}</p>
                    <p className="mt-1 text-xs font-bold text-slate-500">{lane.platform}</p>
                  </div>
                  <span className={`w-fit rounded-full border px-3 py-1 text-[11px] font-black ${priorityClass(lane.priority)}`}>{lane.priority}</span>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-600">{lane.check}</p>
                <p className="mt-2 text-xs font-bold text-rose-700">Risk: {lane.risk}</p>
                <ul className="mt-3 grid gap-1 text-xs font-semibold text-slate-500">
                  {lane.evidenceRequired.map((evidence) => <li key={evidence} className="flex gap-2"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-700" />{evidence}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <ShieldCheck className="h-6 w-6 text-emerald-700" />
            <CardTitle>Safe launch rules</CardTitle>
            <CardDescription>Keep the web app stable before moving into app stores.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="grid gap-2 text-sm text-slate-700">
              {report.safeLaunchRules.map((rule) => <li key={rule} className="flex gap-2 leading-6"><CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-700" />{rule}</li>)}
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Rocket className="h-6 w-6 text-emerald-700" />
            <CardTitle>Runbook</CardTitle>
            <CardDescription>Use this before Android internal testing, Play Store or TestFlight.</CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="grid list-decimal gap-2 pl-5 text-sm text-slate-700">
              {report.runbook.map((item) => <li key={item} className="pl-1 leading-6">{item}</li>)}
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
