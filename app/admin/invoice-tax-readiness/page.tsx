import { BadgeCheck, FileCheck2, IndianRupee, LockKeyhole, ReceiptText, ServerCog, ShieldCheck, TerminalSquare } from 'lucide-react'
import { AdminShell } from '@/components/admin/admin-shell'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getInvoiceTaxReadinessReport } from '@/lib/billing/invoice-tax-readiness'

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

export default function InvoiceTaxReadinessPage() {
  const report = getInvoiceTaxReadinessReport()

  return (
    <AdminShell>
      <div className="grid gap-6">
        <div className="rounded-[2rem] border border-emerald-100 bg-gradient-to-br from-white via-emerald-50 to-white p-5 shadow-soft sm:p-7">
          <Badge>Phase 86 · Billing documents</Badge>
          <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Invoice/tax readiness</h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700 sm:text-base">
                Prepare receipts, tax invoices, refund notes, credit notes and billing exports before taking paid production traffic.
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
              <ReceiptText className="h-6 w-6 text-emerald-700" />
              <CardTitle>Billing document controls</CardTitle>
              <CardDescription>Review every P0 item before switching invoice/tax mode to production issue.</CardDescription>
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
                  npm run invoice-tax:readiness<br />
                  /api/admin/invoice-tax-readiness
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <ShieldCheck className="h-6 w-6 text-emerald-700" />
                <CardTitle>Launch policy</CardTitle>
                <CardDescription>Safe rules before issuing billing documents.</CardDescription>
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
            <CardTitle>Receipt, invoice and refund lanes</CardTitle>
            <CardDescription>Trigger, required fields and safety rules for every billing document type.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {report.invoiceTaxLanes.map((lane) => (
                <div key={lane.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-black ${priorityClass(lane.priority)}`}>{lane.priority}</span>
                    <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-black text-emerald-800">{lane.documentType}</span>
                  </div>
                  <h2 className="mt-3 font-black text-slate-950">{lane.id}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-700"><strong>Trigger:</strong> {lane.trigger}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-700"><strong>Fields:</strong> {lane.requiredFields}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-700"><strong>Safety:</strong> {lane.safetyRule}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <BadgeCheck className="h-6 w-6 text-emerald-700" />
              <CardTitle>Before issue mode</CardTitle>
              <CardDescription>Minimum proof required before sending real billing documents.</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="grid gap-2 text-sm leading-6 text-slate-700">
                <li className="flex gap-2"><ServerCog className="mt-1 h-4 w-4 shrink-0 text-emerald-700" />Receipt, invoice and refund templates reviewed on mobile and desktop.</li>
                <li className="flex gap-2"><ServerCog className="mt-1 h-4 w-4 shrink-0 text-emerald-700" />Seller profile, numbering policy and GST/tax language reviewed by finance/legal owner.</li>
                <li className="flex gap-2"><ServerCog className="mt-1 h-4 w-4 shrink-0 text-emerald-700" />Billing document access is limited to account owner and finance/admin permissions.</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <IndianRupee className="h-6 w-6 text-emerald-700" />
              <CardTitle>Billing safety boundaries</CardTitle>
              <CardDescription>Keep these data points out of receipts, invoices, exports and support screenshots.</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="grid gap-2 text-sm leading-6 text-slate-700">
                <li>OTP, UPI PIN, CVV, passwords and full card/bank numbers</li>
                <li>Gateway webhook signatures, private tokens and raw provider payloads</li>
                <li>Signed document URLs, private vault files and raw complaint evidence</li>
                <li>Unmasked exports sent to support, growth or public analytics tools</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminShell>
  )
}
