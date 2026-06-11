import { AlertTriangle, BadgeCheck, Banknote, FileCheck2, LifeBuoy, LockKeyhole, ReceiptText, ShieldCheck, TerminalSquare } from 'lucide-react'
import { AdminShell } from '@/components/admin/admin-shell'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getRefundDisputeReadinessReport } from '@/lib/billing/refund-dispute-readiness'

const statusClass = (status: string) => {
  if (status === 'PASS') return 'border-emerald-200 bg-emerald-50 text-emerald-800'
  if (status === 'READY_TO_TEST') return 'border-sky-200 bg-sky-50 text-sky-800'
  if (status === 'BLOCKED') return 'border-rose-200 bg-rose-50 text-rose-800'
  return 'border-amber-200 bg-amber-50 text-amber-800'
}

const priorityClass = (priority: string) => {
  if (priority === 'P0') return 'border-rose-200 bg-rose-50 text-rose-800'
  if (priority === 'P1') return 'border-amber-200 bg-amber-50 text-amber-800'
  return 'border-slate-200 bg-slate-50 text-slate-700'
}

export default function RefundDisputeReadinessPage() {
  const report = getRefundDisputeReadinessReport()

  return (
    <AdminShell>
      <div className="grid gap-6">
        <div className="rounded-[2rem] border border-emerald-100 bg-gradient-to-br from-white via-emerald-50 to-white p-5 shadow-soft sm:p-7">
          <Badge>Phase 87 · Billing disputes</Badge>
          <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Refund/dispute readiness</h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700 sm:text-base">
                Prepare cancellation, refund, failed payment, duplicate payment and chargeback workflows before paid users depend on billing support.
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
              <Banknote className="h-6 w-6 text-emerald-700" />
              <CardTitle>Refund and dispute controls</CardTitle>
              <CardDescription>Review every P0 item before enabling paid production traffic and billing support operations.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {report.controls.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`rounded-full border px-2 py-0.5 text-[10px] font-black ${priorityClass(item.priority)}`}>{item.priority}</span>
                          <span className={`rounded-full border px-2 py-0.5 text-[10px] font-black ${statusClass(item.status)}`}>{item.status}</span>
                        </div>
                        <h2 className="mt-2 font-black text-slate-950">{item.label}</h2>
                        <p className="mt-1 break-words font-mono text-xs text-slate-500">{item.envValue}</p>
                      </div>
                    </div>
                    <div className="mt-3 grid gap-3 lg:grid-cols-3">
                      <div>
                        <p className="text-xs font-black uppercase tracking-wide text-slate-500">Pass condition</p>
                        <p className="mt-1 text-sm leading-6 text-slate-700">{item.passCondition}</p>
                      </div>
                      <div>
                        <p className="text-xs font-black uppercase tracking-wide text-slate-500">Evidence</p>
                        <p className="mt-1 text-sm leading-6 text-slate-700">{item.evidenceRequired}</p>
                      </div>
                      <div>
                        <p className="text-xs font-black uppercase tracking-wide text-slate-500">Risk</p>
                        <p className="mt-1 text-sm leading-6 text-slate-700">{item.riskIfSkipped}</p>
                      </div>
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
                  npm run refund-dispute:readiness<br />
                  /api/admin/refund-dispute-readiness
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <ShieldCheck className="h-6 w-6 text-emerald-700" />
                <CardTitle>Launch policy</CardTitle>
                <CardDescription>Safe rules before refund or cancellation operations go live.</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="grid gap-2 text-sm leading-6 text-slate-700">
                  {report.launchPolicy.map((item) => <li key={item} className="flex gap-2"><LockKeyhole className="mt-1 h-4 w-4 shrink-0 text-emerald-700" />{item}</li>)}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card>
          <CardHeader>
            <FileCheck2 className="h-6 w-6 text-emerald-700" />
            <CardTitle>Cancellation, refund and dispute lanes</CardTitle>
            <CardDescription>Trigger, owner, evidence and safety rule for every billing support lane.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {report.refundDisputeLanes.map((lane) => (
                <div key={lane.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-black ${priorityClass(lane.priority)}`}>{lane.priority}</span>
                    <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-black text-emerald-800">{lane.lane}</span>
                  </div>
                  <h2 className="mt-3 font-black text-slate-950">{lane.id}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-700"><strong>Trigger:</strong> {lane.trigger}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-700"><strong>Owner:</strong> {lane.owner}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-700"><strong>Evidence:</strong> {lane.requiredEvidence}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-700"><strong>Safety:</strong> {lane.safetyRule}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <BadgeCheck className="h-6 w-6 text-emerald-700" />
              <CardTitle>Before paid launch</CardTitle>
              <CardDescription>Minimum evidence for public billing operations.</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="grid gap-2 text-sm leading-6 text-slate-700">
                <li className="flex gap-2"><ReceiptText className="mt-1 h-4 w-4 shrink-0 text-emerald-700" />Refund policy and cancellation flow are reviewed on mobile and desktop.</li>
                <li className="flex gap-2"><ReceiptText className="mt-1 h-4 w-4 shrink-0 text-emerald-700" />Failed payment never unlocks premium without verified server-side state.</li>
                <li className="flex gap-2"><ReceiptText className="mt-1 h-4 w-4 shrink-0 text-emerald-700" />Refund/dispute evidence is privacy-safe and audit logged.</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <AlertTriangle className="h-6 w-6 text-emerald-700" />
              <CardTitle>Never ask users for</CardTitle>
              <CardDescription>Billing support must not request secrets.</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="grid gap-2 text-sm leading-6 text-slate-700">
                <li>OTP, passwords, backup codes, UPI PIN, CVV or full card number</li>
                <li>Raw bank statement screenshots with unmasked account details</li>
                <li>Webhook signatures, provider tokens or signed document vault URLs</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <LifeBuoy className="h-6 w-6 text-emerald-700" />
              <CardTitle>Support wording</CardTitle>
              <CardDescription>Keep promises safe and verifiable.</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="grid gap-2 text-sm leading-6 text-slate-700">
                <li>Say “processing” until gateway status confirms settlement.</li>
                <li>Use masked references and clear next action timelines.</li>
                <li>Escalate finance/legal/tax claims instead of guessing.</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminShell>
  )
}
