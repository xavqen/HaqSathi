import { CheckCircle2, ExternalLink, Mic, ShieldAlert, Smartphone, AlertTriangle } from 'lucide-react'
import { requireAdmin } from '@/lib/auth/session'
import { getVoiceInputReadinessReport } from '@/lib/voice/readiness'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Voice Input Readiness | Admin | HaqSathi AI' }

function statusClass(status: string) {
  if (status === 'PASS' || status === 'READY_TO_TEST') return 'border-emerald-200 bg-emerald-50 text-emerald-800'
  if (status === 'BLOCKED') return 'border-rose-200 bg-rose-50 text-rose-800'
  return 'border-amber-200 bg-amber-50 text-amber-800'
}

export default async function AdminVoiceInputReadinessPage() {
  await requireAdmin()
  const report = getVoiceInputReadinessReport()
  const cards = [
    { label: 'Ready controls', value: report.summary.ready, note: `${report.summary.totalControls} total controls`, icon: CheckCircle2 },
    { label: 'Manual review', value: report.summary.manualRequired, note: 'Needs real device evidence', icon: AlertTriangle },
    { label: 'Mode', value: report.mode, note: 'Assistive voice input only', icon: Mic },
    { label: 'Blocked', value: report.summary.blocked, note: 'Must be zero before launch', icon: ShieldAlert }
  ]

  return (
    <div className="space-y-6">
      <div className="rounded-[1.75rem] border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-white p-5 shadow-soft sm:p-7">
        <Badge className="border-emerald-200 bg-emerald-100 text-emerald-800">Phase 56</Badge>
        <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Voice input readiness</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">Track complaint voice dictation safety, browser fallback, mobile UX, consent copy and real-device evidence before enabling voice input for public traffic.</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <a href="/api/admin/voice-input-readiness" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border bg-white px-4 py-2 text-sm font-black text-slate-700 shadow-sm"><ExternalLink className="h-4 w-4" />Open API</a>
            <a href="/complaint" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-black text-primary-foreground shadow-sm"><Mic className="h-4 w-4" />Test complaint voice</a>
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
          <Mic className="h-6 w-6 text-emerald-700" />
          <CardTitle>Voice readiness controls</CardTitle>
          <CardDescription>These checks keep voice input optional, privacy-safe and stable across mobile and desktop browsers.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 lg:grid-cols-2">
            {report.controls.map((control) => (
              <div key={control.id} className="rounded-2xl border bg-white p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <h3 className="font-black text-slate-950">{control.label}</h3>
                    <p className="mt-1 text-sm leading-6 text-slate-600">{control.userValue}</p>
                  </div>
                  <span className={`shrink-0 rounded-full border px-3 py-1 text-xs font-black ${statusClass(control.status)}`}>{control.status}</span>
                </div>
                <p className="mt-3 rounded-xl bg-slate-50 p-3 font-mono text-xs text-slate-600 break-words">{control.adminValue}</p>
                <p className="mt-3 text-xs leading-5 text-slate-500">{control.launchNote}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <Smartphone className="h-6 w-6 text-emerald-700" />
            <CardTitle>Supported use cases</CardTitle>
            <CardDescription>Keep voice focused on complaint input, not identity verification.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm leading-6 text-slate-700">
              {report.supportedUseCases.map((item) => <li key={item} className="flex gap-2"><CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-700" />{item}</li>)}
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <ShieldAlert className="h-6 w-6 text-amber-600" />
            <CardTitle>Safety rules</CardTitle>
            <CardDescription>Voice input can expose private details if handled carelessly.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm leading-6 text-slate-700">
              {report.safetyRules.map((item) => <li key={item} className="flex gap-2"><ShieldAlert className="mt-1 h-4 w-4 shrink-0 text-amber-600" />{item}</li>)}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Minimum launch evidence</CardTitle>
          <CardDescription>Collect real-device proof before sending public traffic to voice-enabled complaint flow.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="grid gap-3 text-sm text-slate-700 md:grid-cols-2">
            {report.launchEvidence.map((item) => <li key={item} className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />{item}</li>)}
          </ul>
          <div className="mt-5 rounded-2xl border bg-slate-50 p-4">
            <p className="text-sm font-black text-slate-950">Local command</p>
            <pre className="mt-2 overflow-x-auto rounded-xl bg-slate-950 p-3 text-xs font-bold text-emerald-100">npm run voice:readiness</pre>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
