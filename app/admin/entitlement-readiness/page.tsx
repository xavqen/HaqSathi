import { AlertTriangle, BadgeCheck, CreditCard, Gauge, LockKeyhole, ServerCog, ShieldCheck, TerminalSquare } from 'lucide-react'
import { requireAdmin } from '@/lib/auth/session'
import { getEntitlementReadinessReport, type EntitlementPriority, type EntitlementStatus } from '@/lib/billing/entitlement-readiness'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

function statusClass(status: EntitlementStatus) {
  if (status === 'PASS') return 'border-emerald-200 bg-emerald-50 text-emerald-800'
  if (status === 'READY_TO_TEST') return 'border-blue-200 bg-blue-50 text-blue-800'
  if (status === 'MANUAL_REQUIRED') return 'border-amber-200 bg-amber-50 text-amber-800'
  return 'border-rose-200 bg-rose-50 text-rose-800'
}

function priorityClass(priority: EntitlementPriority) {
  if (priority === 'P0') return 'border-rose-200 bg-rose-50 text-rose-800'
  if (priority === 'P1') return 'border-amber-200 bg-amber-50 text-amber-800'
  return 'border-slate-200 bg-slate-50 text-slate-700'
}

export default async function EntitlementReadinessPage() {
  await requireAdmin()
  const report = getEntitlementReadinessReport()

  return (
    <div className="grid gap-6">
      <section className="rounded-[2rem] border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-white p-5 shadow-soft sm:p-7">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-3xl">
            <Badge>Phase 85</Badge>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Subscription entitlement readiness</h1>
            <p className="mt-3 text-sm leading-6 text-slate-700 sm:text-base">
              Verify plan limits, paywall copy, downgrade behavior and server-side subscription state before enforcing Premium, Family or Agent access in production.
            </p>
          </div>
          <div className="rounded-2xl border border-emerald-100 bg-white p-4 text-sm shadow-sm xl:min-w-[18rem]">
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
            <CardDescription>Current mode</CardDescription>
            <CardTitle className="break-words text-2xl text-blue-700">{report.mode}</CardTitle>
          </CardHeader>
        </Card>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
        <Card>
          <CardHeader>
            <CreditCard className="h-6 w-6 text-emerald-700" />
            <CardTitle>Readiness controls</CardTitle>
            <CardDescription>Keep payment access predictable before making paid entitlements strict.</CardDescription>
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
                npm run entitlement:readiness<br />
                /api/admin/entitlement-readiness
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <ShieldCheck className="h-6 w-6 text-emerald-700" />
              <CardTitle>Launch policy</CardTitle>
              <CardDescription>Rules to protect users while testing paid access.</CardDescription>
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
          <Gauge className="h-6 w-6 text-emerald-700" />
          <CardTitle>Plan entitlement lanes</CardTitle>
          <CardDescription>Expected access behavior by plan, including downgrade and safety rules.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {report.entitlementLanes.map((lane) => (
              <div key={lane.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded-full border px-2 py-0.5 text-[10px] font-black ${priorityClass(lane.priority)}`}>{lane.priority}</span>
                  <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-black text-emerald-800">{lane.plan}</span>
                </div>
                <h2 className="mt-3 font-black text-slate-950">{lane.capability}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-700"><strong>Expected:</strong> {lane.expectedBehavior}</p>
                <p className="mt-2 text-sm leading-6 text-slate-700"><strong>Downgrade:</strong> {lane.downgradeBehavior}</p>
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
            <CardTitle>Before enforce mode</CardTitle>
            <CardDescription>Minimum proof required before strict paid access.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="grid gap-2 text-sm leading-6 text-slate-700">
              <li className="flex gap-2"><ServerCog className="mt-1 h-4 w-4 shrink-0 text-emerald-700" />Razorpay checkout, verify and webhook evidence saved.</li>
              <li className="flex gap-2"><ServerCog className="mt-1 h-4 w-4 shrink-0 text-emerald-700" />Free limit, paid allow, failed renewal and cancellation states tested.</li>
              <li className="flex gap-2"><ServerCog className="mt-1 h-4 w-4 shrink-0 text-emerald-700" />Pricing and paywall copy reviewed on mobile and desktop.</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <AlertTriangle className="h-6 w-6 text-rose-700" />
            <CardTitle>Never gate these</CardTitle>
            <CardDescription>Trust/safety routes must stay accessible even on free, failed-payment or cancelled states.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="grid gap-2 text-sm leading-6 text-slate-700">
              <li>Emergency and cyber fraud guidance</li>
              <li>Privacy, terms, disclaimer and data export/delete pages</li>
              <li>Official source links and safety warnings</li>
              <li>Billing receipts, cancellation, support and account security pages</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
