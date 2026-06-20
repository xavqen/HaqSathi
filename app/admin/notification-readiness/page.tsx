import { BellRing, CheckCircle2, MessageCircle, ShieldAlert, Smartphone } from 'lucide-react'
import { requireAdmin } from '@/lib/auth/session'
import { getNotificationReadinessReport } from '@/lib/notifications/readiness'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Notification Readiness | Admin' }

function statusClass(status: string) {
  if (status === 'PASS' || status === 'READY_TO_TEST') return 'border-emerald-200 bg-emerald-50 text-emerald-800'
  if (status === 'BLOCKED') return 'border-rose-200 bg-rose-50 text-rose-800'
  return 'border-amber-200 bg-amber-50 text-amber-800'
}

export default async function AdminNotificationReadinessPage() {
  await requireAdmin()
  const report = getNotificationReadinessReport()

  return (
    <div className="space-y-6">
      <div className="rounded-[1.75rem] border border-emerald-100 bg-gradient-to-br from-white via-emerald-50/70 to-white p-5 shadow-soft sm:p-7">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <Badge className="bg-emerald-100 text-emerald-800">Phase 51</Badge>
            <h1 className="mt-3 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">Notification readiness</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">
              Email, PWA push, WhatsApp and SMS launch controls ek jagah verify karo. Existing reminder queue logic ko touch nahi kiya gaya.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2 rounded-2xl border border-white bg-white/80 p-3 text-center shadow-sm sm:min-w-[320px]">
            <div><p className="text-2xl font-black text-emerald-700">{report.summary.ready}</p><p className="text-xs font-bold text-slate-500">Ready</p></div>
            <div><p className="text-2xl font-black text-amber-600">{report.summary.manualRequired}</p><p className="text-xs font-bold text-slate-500">Manual</p></div>
            <div><p className="text-2xl font-black text-rose-600">{report.summary.blocked}</p><p className="text-xs font-bold text-slate-500">Blocked</p></div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader>
            <BellRing className="h-6 w-6 text-emerald-700" />
            <CardTitle>Email reminders</CardTitle>
            <CardDescription>Resend sender/domain + inbox delivery evidence.</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <Smartphone className="h-6 w-6 text-emerald-700" />
            <CardTitle>PWA push</CardTitle>
            <CardDescription>HTTPS domain, VAPID keys and mobile permission QA.</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <MessageCircle className="h-6 w-6 text-emerald-700" />
            <CardTitle>WhatsApp/SMS</CardTitle>
            <CardDescription>Provider sandbox, consent and sensitive-data safety.</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <ShieldAlert className="h-6 w-6 text-emerald-700" />
            <CardTitle>Dry-run guard</CardTitle>
            <CardDescription>Prevent accidental live sends before evidence is saved.</CardDescription>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Channel readiness matrix</CardTitle>
          <CardDescription>Run <code className="rounded bg-slate-100 px-1.5 py-0.5">npm run notification:readiness</code> and save the generated JSON/CSV evidence.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {report.channels.map((channel) => (
              <div key={channel.id} className="rounded-2xl border bg-white p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <h2 className="font-black text-slate-950">{channel.label}</h2>
                    <p className="mt-1 text-sm leading-6 text-slate-600">{channel.userValue}</p>
                    <p className="mt-2 text-xs font-bold text-slate-500">{channel.adminValue}</p>
                  </div>
                  <span className={`shrink-0 rounded-full border px-3 py-1 text-xs font-black ${statusClass(channel.status)}`}>{channel.status}</span>
                </div>
                <p className="mt-3 rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-600">{channel.launchNote}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Minimum launch evidence</CardTitle>
            <CardDescription>Public launch se pehle ye proof save karo.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm text-slate-700">
              {report.minimumEvidence.map((item) => <li key={item} className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />{item}</li>)}
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Safe launch rules</CardTitle>
            <CardDescription>Notifications me private data leak nahi hona chahiye.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm text-slate-700">
              {report.safeLaunchRules.map((item) => <li key={item} className="flex gap-2"><ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />{item}</li>)}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Protected API</CardTitle>
          <CardDescription>Admin-only readiness endpoint for launch QA automation.</CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="overflow-x-auto rounded-2xl bg-slate-950 p-4 text-xs font-bold text-emerald-100">GET /api/admin/notification-readiness</pre>
        </CardContent>
      </Card>
    </div>
  )
}
