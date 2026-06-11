import { AlertTriangle, BadgeCheck, Banknote, DatabaseZap, FileCheck2, LifeBuoy, LockKeyhole, ReceiptText, ShieldCheck, TerminalSquare } from 'lucide-react'
import { AdminShell } from '@/components/admin/admin-shell'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getPaymentReconciliationReadinessReport } from '@/lib/billing/payment-reconciliation-readiness'

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

export default function PaymentReconciliationPage() {
  const report = getPaymentReconciliationReadinessReport()

  return (
    <AdminShell>
      <div className="grid gap-6">
        <div className="rounded-[2rem] border border-emerald-100 bg-gradient-to-br from-white via-emerald-50 to-white p-5 shadow-soft sm:p-7">
          <Badge>Phase 88 · Finance operations</Badge>
          <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Payment reconciliation readiness</h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700 sm:text-base">
                Match Razorpay gateway truth, database orders, subscriptions, receipts, refunds, payout reports and finance exports before paid public traffic grows.
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
              <DatabaseZap className="h-6 w-6 text-emerald-700" />
              <CardTitle>Reconciliation controls</CardTitle>
              <CardDescription>Review gateway, database, invoice, refund, payout and anomaly gates before accepting real paid traffic.</CardDescription>
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
                <CardDescription>Generate evidence and review the protected API.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-2xl bg-slate-950 p-4 font-mono text-xs font-bold leading-6 text-emerald-100">
                  npm run payment-reconciliation:readiness<br />
                  /api/admin/payment-reconciliation-readiness
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <ShieldCheck className="h-6 w-6 text-emerald-700" />
                <CardTitle>Launch policy</CardTitle>
                <CardDescription>Safe rules before finance reconciliation goes live.</CardDescription>
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
            <CardTitle>Money-flow lanes</CardTitle>
            <CardDescription>Source, target, owner and safety rule for every reconciliation path.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {report.paymentReconciliationLanes.map((lane) => (
                <div key={lane.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-black ${priorityClass(lane.priority)}`}>{lane.priority}</span>
                    <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-black text-emerald-800">{lane.lane}</span>
                  </div>
                  <h2 className="mt-3 font-black text-slate-950">{lane.id}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-700"><strong>Source:</strong> {lane.source}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-700"><strong>Target:</strong> {lane.target}</p>
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
              <CardDescription>Minimum money-flow proof for production billing.</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="grid gap-2 text-sm leading-6 text-slate-700">
                <li className="flex gap-2"><ReceiptText className="mt-1 h-4 w-4 shrink-0 text-emerald-700" />Gateway payment status matches the database order and subscription state.</li>
                <li className="flex gap-2"><ReceiptText className="mt-1 h-4 w-4 shrink-0 text-emerald-700" />Receipt/invoice totals match paid amount, currency, discount and tax policy.</li>
                <li className="flex gap-2"><ReceiptText className="mt-1 h-4 w-4 shrink-0 text-emerald-700" />Refund, dispute and payout totals have manual review evidence.</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <AlertTriangle className="h-6 w-6 text-emerald-700" />
              <CardTitle>Never store in evidence</CardTitle>
              <CardDescription>Finance artifacts must stay privacy-safe.</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="grid gap-2 text-sm leading-6 text-slate-700">
                <li>OTP, passwords, backup codes, UPI PIN, CVV or full card number</li>
                <li>Raw gateway webhook signatures, provider keys or raw payload dumps</li>
                <li>Unredacted bank statements, private documents or signed vault URLs</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <LifeBuoy className="h-6 w-6 text-emerald-700" />
              <CardTitle>Support wording</CardTitle>
              <CardDescription>Keep billing communication accurate.</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="grid gap-2 text-sm leading-6 text-slate-700">
                <li>Say “we are verifying the gateway status” until reconciliation passes.</li>
                <li>Use masked payment references only.</li>
                <li>Escalate mismatches to finance/engineering instead of guessing.</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <Banknote className="h-6 w-6 text-emerald-700" />
            <CardTitle>Related billing gates</CardTitle>
            <CardDescription>Reconciliation connects payment lifecycle, invoice/tax, entitlement and refund/dispute readiness.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3 text-sm font-bold">
              <a href="/admin/payment-lifecycle" className="rounded-xl border px-4 py-2 hover:bg-slate-50">Payment lifecycle</a>
              <a href="/admin/invoice-tax-readiness" className="rounded-xl border px-4 py-2 hover:bg-slate-50">Invoice/tax</a>
              <a href="/admin/entitlement-readiness" className="rounded-xl border px-4 py-2 hover:bg-slate-50">Entitlements</a>
              <a href="/admin/refund-dispute-readiness" className="rounded-xl border px-4 py-2 hover:bg-slate-50">Refund disputes</a>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  )
}
