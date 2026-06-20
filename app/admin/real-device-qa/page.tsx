import { AlertTriangle, Bug, CheckCircle2, ExternalLink, Laptop, ListChecks, MonitorSmartphone, ShieldCheck, Smartphone, Tablet } from 'lucide-react'
import { requireAdmin } from '@/lib/auth/session'
import { getRealDeviceQaReadinessReport } from '@/lib/device-qa/readiness'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Real Device QA | Admin' }

function statusClass(status: string) {
  if (status === 'PASS' || status === 'READY_TO_TEST') return 'border-emerald-200 bg-emerald-50 text-emerald-800'
  if (status === 'BLOCKED') return 'border-rose-200 bg-rose-50 text-rose-800'
  return 'border-amber-200 bg-amber-50 text-amber-800'
}

function priorityClass(priority: string) {
  if (priority === 'P0') return 'border-rose-200 bg-rose-50 text-rose-800'
  if (priority === 'P1') return 'border-amber-200 bg-amber-50 text-amber-800'
  return 'border-sky-200 bg-sky-50 text-sky-800'
}

function deviceIcon(type: string) {
  if (type === 'mobile') return Smartphone
  if (type === 'tablet') return Tablet
  return Laptop
}

export default async function AdminRealDeviceQaPage() {
  await requireAdmin()
  const report = getRealDeviceQaReadinessReport()
  const cards = [
    { label: 'Devices', value: report.summary.devices, note: `${report.summary.p0Devices} P0 launch devices`, icon: MonitorSmartphone },
    { label: 'Core routes', value: report.summary.coreRoutes, note: 'Must be screenshot-tested', icon: ListChecks },
    { label: 'Manual gates', value: report.summary.manualRequired, note: 'Need proof before launch', icon: AlertTriangle },
    { label: 'Blocked', value: report.summary.blocked, note: 'Must be cleared first', icon: ShieldCheck }
  ]

  return (
    <div className="space-y-6">
      <div className="rounded-[1.75rem] border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-white p-5 shadow-soft sm:p-7">
        <Badge className="border-emerald-200 bg-emerald-100 text-emerald-800">Phase 70</Badge>
        <div className="mt-4 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div className="min-w-0">
            <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Real device QA readiness</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">Screenshot-driven mobile, tablet and desktop launch QA for the exact UI issues users see on real devices: header crowding, bottom-nav overlap, dropdown overflow, keyboard hiding actions and wide table clipping.</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <a href="/api/admin/real-device-qa-readiness" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border bg-white px-4 py-2 text-sm font-black text-slate-700 shadow-sm"><ExternalLink className="h-4 w-4" />Open API</a>
            <a href="/admin/mobile-app-readiness" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-black text-primary-foreground shadow-sm"><Smartphone className="h-4 w-4" />Mobile app QA</a>
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
          <MonitorSmartphone className="h-6 w-6 text-emerald-700" />
          <CardTitle>Readiness controls</CardTitle>
          <CardDescription>These flags should be marked only after real screenshots or recorded evidence exist.</CardDescription>
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
          <CardTitle>Device matrix</CardTitle>
          <CardDescription>Test these devices before marking the public launch green.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 xl:grid-cols-2">
            {report.devices.map((device) => {
              const Icon = deviceIcon(device.deviceType)
              return (
                <div key={device.id} className="rounded-2xl border bg-slate-50 p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 shrink-0 text-emerald-700" />
                        <p className="text-sm font-black text-slate-950">{device.label}</p>
                      </div>
                      <p className="mt-1 text-xs font-bold text-slate-500">{device.viewport} · {device.deviceType}</p>
                    </div>
                    <span className={`w-fit rounded-full border px-3 py-1 text-[11px] font-black ${priorityClass(device.priority)}`}>{device.priority}</span>
                  </div>
                  <ul className="mt-3 grid gap-1 text-xs font-semibold text-slate-600">
                    {device.coreChecks.map((check) => <li key={check} className="flex gap-2"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-700" />{check}</li>)}
                  </ul>
                  <p className="mt-3 text-xs font-black text-rose-700">Risk if skipped: {device.riskIfSkipped}</p>
                  <p className="mt-2 text-xs font-bold text-slate-500">Evidence: {device.evidenceRequired.join(', ')}</p>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <Bug className="h-6 w-6 text-emerald-700" />
            <CardTitle>Bug capture template</CardTitle>
            <CardDescription>Every UI bug should include enough information to reproduce it fast.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="grid gap-2 text-sm text-slate-700">
              {report.bugReportTemplate.map((item) => <li key={item} className="flex gap-2 leading-6"><CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-700" />{item}</li>)}
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <ShieldCheck className="h-6 w-6 text-emerald-700" />
            <CardTitle>Runbook</CardTitle>
            <CardDescription>Follow this whenever navbar, global CSS, admin shell, forms or popovers change.</CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="grid list-decimal gap-2 pl-5 text-sm text-slate-700">
              {report.runbook.map((item) => <li key={item} className="pl-1 leading-6">{item}</li>)}
            </ol>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <Laptop className="h-6 w-6 text-emerald-700" />
          <CardTitle>Core routes to screenshot-test</CardTitle>
          <CardDescription>Use these as the minimum device QA route list.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {report.coreRoutes.map((route) => <span key={route} className="rounded-full border bg-white px-3 py-1.5 text-xs font-black text-slate-700">{route}</span>)}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
