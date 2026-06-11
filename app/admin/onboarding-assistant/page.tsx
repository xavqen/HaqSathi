import { AlertTriangle, Bot, CheckCircle2, Compass, ShieldCheck, Sparkles, TerminalSquare, UserRoundCheck } from 'lucide-react'
import { requireAdmin } from '@/lib/auth/session'
import { getOnboardingAssistantReadinessReport, type OnboardingAssistantPriority, type OnboardingAssistantStatus } from '@/lib/onboarding/assistant-readiness'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

function statusClass(status: OnboardingAssistantStatus) {
  if (status === 'PASS') return 'border-emerald-200 bg-emerald-50 text-emerald-800'
  if (status === 'READY_TO_TEST') return 'border-blue-200 bg-blue-50 text-blue-800'
  if (status === 'MANUAL_REQUIRED') return 'border-amber-200 bg-amber-50 text-amber-800'
  return 'border-rose-200 bg-rose-50 text-rose-800'
}

function priorityClass(priority: OnboardingAssistantPriority) {
  if (priority === 'P0') return 'border-rose-200 bg-rose-50 text-rose-800'
  if (priority === 'P1') return 'border-amber-200 bg-amber-50 text-amber-800'
  return 'border-slate-200 bg-slate-50 text-slate-700'
}

export default async function OnboardingAssistantReadinessPage() {
  await requireAdmin()
  const report = getOnboardingAssistantReadinessReport()

  return (
    <div className="grid gap-6">
      <section className="rounded-[2rem] border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-white p-5 shadow-soft sm:p-7">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-3xl">
            <Badge>Phase 84</Badge>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">AI onboarding assistant readiness</h1>
            <p className="mt-3 text-sm leading-6 text-slate-700 sm:text-base">
              Verify the first-run guided experience so new users quickly reach the right complaint, UPI, scheme, document or status tool without sharing sensitive details.
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
            <CardDescription>Guided steps</CardDescription>
            <CardTitle className="text-3xl text-blue-700">{report.summary.guidedSteps}</CardTitle>
          </CardHeader>
        </Card>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
        <Card>
          <CardHeader>
            <Bot className="h-6 w-6 text-emerald-700" />
            <CardTitle>Readiness controls</CardTitle>
            <CardDescription>These gates keep onboarding helpful, privacy-safe and non-overwhelming on mobile and desktop.</CardDescription>
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
                npm run onboarding:readiness<br />
                /api/admin/onboarding-assistant-readiness
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <ShieldCheck className="h-6 w-6 text-emerald-700" />
              <CardTitle>First-run safety</CardTitle>
              <CardDescription>Keep the guided flow useful without collecting secrets.</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="grid gap-2 text-sm leading-6 text-slate-700">
                <li className="flex gap-2"><UserRoundCheck className="mt-1 h-4 w-4 shrink-0 text-emerald-700" />Ask only goal, state and language first.</li>
                <li className="flex gap-2"><Compass className="mt-1 h-4 w-4 shrink-0 text-blue-700" />Route users to one clear next action, not every tool at once.</li>
                <li className="flex gap-2"><AlertTriangle className="mt-1 h-4 w-4 shrink-0 text-rose-600" />Never ask for OTP, password, UPI PIN, CVV or full bank/card data.</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <Sparkles className="h-6 w-6 text-emerald-700" />
          <CardTitle>Guided assistant steps</CardTitle>
          <CardDescription>Each step has a safe prompt, route and safety rule for first-session onboarding.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {report.assistantSteps.map((step) => (
              <div key={step.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded-full border px-2 py-0.5 text-[10px] font-black ${priorityClass(step.priority)}`}>{step.priority}</span>
                  <p className="font-black text-slate-950">{step.label}</p>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-700"><strong>Goal:</strong> {step.goal}</p>
                <p className="mt-2 text-sm leading-6 text-slate-700"><strong>Prompt:</strong> {step.safePrompt}</p>
                <p className="mt-2 break-words font-mono text-xs text-slate-500">{step.recommendedRoute}</p>
                <p className="mt-2 text-sm leading-6 text-slate-700"><strong>Safety:</strong> {step.safetyRule}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CheckCircle2 className="h-6 w-6 text-emerald-700" />
            <CardTitle>First-run checklist</CardTitle>
            <CardDescription>Use this checklist before promoting guided onboarding publicly.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="grid gap-2 text-sm text-slate-700">
              {report.firstRunChecklist.map((item) => <li key={item} className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />{item}</li>)}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <AlertTriangle className="h-6 w-6 text-rose-700" />
            <CardTitle>Unsafe prompt rules</CardTitle>
            <CardDescription>Prompts and guided cards must avoid these mistakes.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="grid gap-2 text-sm text-slate-700">
              {report.unsafePromptRules.map((item) => <li key={item} className="flex gap-2"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />{item}</li>)}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
