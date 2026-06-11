import { AlertTriangle, CheckCircle2, MessageSquareQuote, ShieldCheck, Sparkles, Star, TerminalSquare, UserCheck } from 'lucide-react'
import { requireAdmin } from '@/lib/auth/session'
import { getFeedbackReadinessReport, type FeedbackReadinessPriority, type FeedbackReadinessStatus } from '@/lib/growth/feedback-readiness'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

function statusClass(status: FeedbackReadinessStatus) {
  if (status === 'PASS') return 'border-emerald-200 bg-emerald-50 text-emerald-800'
  if (status === 'READY_TO_TEST') return 'border-blue-200 bg-blue-50 text-blue-800'
  if (status === 'MANUAL_REQUIRED') return 'border-amber-200 bg-amber-50 text-amber-800'
  return 'border-rose-200 bg-rose-50 text-rose-800'
}

function priorityClass(priority: FeedbackReadinessPriority) {
  if (priority === 'P0') return 'border-rose-200 bg-rose-50 text-rose-800'
  if (priority === 'P1') return 'border-amber-200 bg-amber-50 text-amber-800'
  return 'border-slate-200 bg-slate-50 text-slate-700'
}

export default async function FeedbackReadinessPage() {
  await requireAdmin()
  const report = getFeedbackReadinessReport()

  return (
    <div className="grid gap-6">
      <section className="rounded-[2rem] border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-white p-5 shadow-soft sm:p-7">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-3xl">
            <Badge>Phase 83</Badge>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Feedback, reviews &amp; testimonial moderation readiness</h1>
            <p className="mt-3 text-sm leading-6 text-slate-700 sm:text-base">
              Make public reviews, success stories and feedback insights safe before using them in marketing, pricing pages or launch proof.
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
            <CardDescription>Blocked</CardDescription>
            <CardTitle className="text-3xl text-rose-700">{report.summary.blocked}</CardTitle>
          </CardHeader>
        </Card>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
        <Card>
          <CardHeader>
            <MessageSquareQuote className="h-6 w-6 text-emerald-700" />
            <CardTitle>Moderation controls</CardTitle>
            <CardDescription>Review these before showing public testimonials or using feedback in growth campaigns.</CardDescription>
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
                npm run feedback:readiness<br />
                /api/admin/feedback-readiness
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <ShieldCheck className="h-6 w-6 text-emerald-700" />
              <CardTitle>Public review safety</CardTitle>
              <CardDescription>Do this before using reviews on landing pages, ads or social proof.</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="grid gap-2 text-sm leading-6 text-slate-700">
                <li className="flex gap-2"><UserCheck className="mt-1 h-4 w-4 shrink-0 text-emerald-700" />Use approved-only testimonials with clear consent.</li>
                <li className="flex gap-2"><AlertTriangle className="mt-1 h-4 w-4 shrink-0 text-rose-600" />Never publish OTPs, passwords, UPI PINs, bank/card details, IDs, screenshots or raw complaint text.</li>
                <li className="flex gap-2"><Star className="mt-1 h-4 w-4 shrink-0 text-amber-600" />Check spam, incentives and referral abuse before highlighting ratings.</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <Sparkles className="h-6 w-6 text-emerald-700" />
          <CardTitle>Moderation lanes</CardTitle>
          <CardDescription>Every lane maps the source, review rule and publish rule for reviews/testimonials.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {report.moderationLanes.map((lane) => (
              <div key={lane.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded-full border px-2 py-0.5 text-[10px] font-black ${priorityClass(lane.priority)}`}>{lane.priority}</span>
                  <p className="font-black text-slate-950">{lane.label}</p>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-700"><strong>Owner:</strong> {lane.owner}</p>
                <p className="mt-2 text-sm leading-6 text-slate-700"><strong>Source:</strong> {lane.intakeSource}</p>
                <p className="mt-2 text-sm leading-6 text-slate-700"><strong>Moderation:</strong> {lane.moderationRule}</p>
                <p className="mt-2 text-sm leading-6 text-slate-700"><strong>Publish:</strong> {lane.publishRule}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CheckCircle2 className="h-6 w-6 text-emerald-700" />
            <CardTitle>Moderation checklist</CardTitle>
            <CardDescription>Use this for every public review/testimonial candidate.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="grid gap-2 text-sm text-slate-700">
              {report.moderationChecklist.map((item) => <li key={item} className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />{item}</li>)}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Star className="h-6 w-6 text-amber-700" />
            <CardTitle>Publish rules</CardTitle>
            <CardDescription>Keep public social proof honest, safe and privacy-first.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="grid gap-2 text-sm text-slate-700">
              {report.publishRules.map((item) => <li key={item} className="flex gap-2"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />{item}</li>)}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
