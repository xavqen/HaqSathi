import { AlertTriangle, CheckCircle2, FileCheck2, Gavel, ListChecks, LockKeyhole, Megaphone, ReceiptText, ShieldCheck, UserCheck } from 'lucide-react'
import { requireAdmin } from '@/lib/auth/session'
import { getLegalComplianceReadinessReport } from '@/lib/legal/compliance-readiness'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Legal Compliance Readiness | Admin' }

function statusClass(status: string) {
  if (status === 'PASS' || status === 'READY_TO_TEST') return 'border-emerald-200 bg-emerald-50 text-emerald-800'
  if (status === 'BLOCKED') return 'border-rose-200 bg-rose-50 text-rose-800'
  return 'border-amber-200 bg-amber-50 text-amber-800'
}

function priorityClass(priority: string) {
  if (priority === 'P0') return 'border-rose-200 bg-rose-50 text-rose-800'
  if (priority === 'P1') return 'border-amber-200 bg-amber-50 text-amber-800'
  return 'border-slate-200 bg-slate-50 text-slate-700'
}

export default async function LegalComplianceReadinessPage() {
  await requireAdmin()
  const report = getLegalComplianceReadinessReport()

  return (
    <div className="grid gap-6">
      <section className="rounded-[2rem] border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-white p-5 shadow-soft sm:p-7">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <Badge>Phase 72</Badge>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Legal compliance readiness</h1>
            <p className="mt-3 text-sm leading-6 text-slate-700 sm:text-base">
              Launch guard for privacy policy, terms, disclaimer, billing copy, ads disclosure, minor safety and guidance-only claims across high-risk public pages.
            </p>
          </div>
          <div className="rounded-2xl border border-emerald-100 bg-white p-4 text-sm shadow-sm lg:min-w-[18rem]">
            <p className="font-black text-slate-950">Next action</p>
            <p className="mt-2 leading-6 text-slate-600">{report.nextAction}</p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total controls</CardDescription>
            <CardTitle className="text-3xl">{report.summary.totalControls}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Ready / pass</CardDescription>
            <CardTitle className="text-3xl text-emerald-700">{report.summary.ready}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Manual required</CardDescription>
            <CardTitle className="text-3xl text-amber-700">{report.summary.manualRequired}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Blocked</CardDescription>
            <CardTitle className="text-3xl text-rose-700">{report.summary.blocked}</CardTitle>
          </CardHeader>
        </Card>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.7fr)]">
        <Card>
          <CardHeader>
            <Gavel className="h-6 w-6 text-emerald-700" />
            <CardTitle>Launch legal controls</CardTitle>
            <CardDescription>Use this as the final legal copy and compliance signoff matrix before public launch.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {report.controls.map((item) => (
                <div key={item.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`rounded-full border px-2.5 py-1 text-[11px] font-black ${priorityClass(item.priority)}`}>{item.priority}</span>
                        <span className={`rounded-full border px-2.5 py-1 text-[11px] font-black ${statusClass(item.status)}`}>{item.status}</span>
                      </div>
                      <h2 className="mt-3 text-base font-black text-slate-950">{item.label}</h2>
                      <p className="mt-1 break-words font-mono text-xs text-slate-500">{item.envValue}</p>
                    </div>
                  </div>
                  <div className="mt-3 grid gap-3 md:grid-cols-3">
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
              <FileCheck2 className="h-6 w-6 text-emerald-700" />
              <CardTitle>Command</CardTitle>
              <CardDescription>Generate local evidence files and review API output.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-2xl bg-slate-950 p-4 font-mono text-xs font-bold leading-6 text-emerald-100">
                npm run legal:readiness<br />
                /api/admin/legal-compliance-readiness
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <ShieldCheck className="h-6 w-6 text-emerald-700" />
              <CardTitle>Review runbook</CardTitle>
              <CardDescription>Follow these steps before setting any legal review flag to true.</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="grid gap-2 text-sm leading-6 text-slate-700">
                {report.runbook.map((step) => <li key={step} className="flex gap-2"><CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-700" />{step}</li>)}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <AlertTriangle className="h-6 w-6 text-amber-700" />
              <CardTitle>High-risk copy rules</CardTitle>
              <CardDescription>Do not launch if any of these fail.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 text-sm leading-6 text-slate-700">
                <div className="flex gap-2"><UserCheck className="mt-1 h-4 w-4 shrink-0 text-emerald-700" />Never claim HaqSathi AI is an official government, court, bank or legal authority.</div>
                <div className="flex gap-2"><ReceiptText className="mt-1 h-4 w-4 shrink-0 text-emerald-700" />Never guarantee refunds, complaint success, scheme approval or legal outcomes.</div>
                <div className="flex gap-2"><LockKeyhole className="mt-1 h-4 w-4 shrink-0 text-emerald-700" />Never ask users for OTP, passwords, UPI PIN, full card numbers or secret banking data.</div>
                <div className="flex gap-2"><Megaphone className="mt-1 h-4 w-4 shrink-0 text-emerald-700" />Disclose ads, affiliate/referral rewards and sponsored placement wherever applicable.</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <ListChecks className="h-6 w-6 text-emerald-700" />
          <CardTitle>Priority page review matrix</CardTitle>
          <CardDescription>Save mobile + desktop screenshots and reviewer notes for these pages.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {report.pageReviews.map((item) => (
              <div key={item.route} className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded-full border px-2.5 py-1 text-[11px] font-black ${priorityClass(item.priority)}`}>{item.priority}</span>
                  <p className="break-all font-mono text-sm font-black text-slate-950">{item.route}</p>
                </div>
                <div className="mt-3 grid gap-4 lg:grid-cols-2">
                  <div>
                    <p className="text-xs font-black uppercase tracking-wide text-slate-500">Review items</p>
                    <ul className="mt-2 grid gap-1 text-sm leading-6 text-slate-700">
                      {item.reviewItems.map((check) => <li key={check} className="flex gap-2"><CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-700" />{check}</li>)}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-wide text-slate-500">Evidence required</p>
                    <ul className="mt-2 grid gap-1 text-sm leading-6 text-slate-700">
                      {item.evidenceRequired.map((evidence) => <li key={evidence} className="flex gap-2"><FileCheck2 className="mt-1 h-4 w-4 shrink-0 text-emerald-700" />{evidence}</li>)}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
