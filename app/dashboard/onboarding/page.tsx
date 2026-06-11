import Link from 'next/link'
import { ArrowRight, CheckCircle2, ShieldAlert, Sparkles } from 'lucide-react'
import { requireUser } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { getRecommendedFirstRunGuide } from '@/lib/onboarding/assistant-readiness'
import { OnboardingForm } from '@/components/forms/onboarding-form'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export const dynamic = 'force-dynamic'

export default async function Page() {
  const user = await requireUser()
  const onboarding = await db.onboardingProgress.findUnique({ where: { userId: user.id } })
  const guide = getRecommendedFirstRunGuide(onboarding)

  return (
    <div className="grid gap-6">
      <section className="rounded-[2rem] border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-white p-5 shadow-soft sm:p-7">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <Badge>Guided setup</Badge>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Onboarding</h1>
            <p className="mt-2 text-sm leading-6 text-slate-700 sm:text-base">
              Set your goal, state and language so HaqSathi can route you to the right first tool without asking for sensitive details.
            </p>
          </div>
          <div className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm lg:min-w-[16rem]">
            <p className="text-xs font-black uppercase tracking-wide text-slate-500">Setup progress</p>
            <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-emerald-600" style={{ width: `${guide.progress}%` }} />
            </div>
            <p className="mt-2 text-sm font-bold text-slate-700">{guide.progress}% complete</p>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        <OnboardingForm initial={onboarding} />

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <Sparkles className="h-6 w-6 text-emerald-700" />
              <CardTitle>Suggested next step</CardTitle>
              <CardDescription>{guide.next.reason}</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href={guide.next.href} className="inline-flex min-h-11 w-full items-center justify-center rounded-2xl bg-primary px-4 py-3 text-sm font-black text-primary-foreground hover:bg-primary/90">
                {guide.next.label}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <p className="mt-3 rounded-2xl bg-amber-50 p-3 text-xs font-semibold leading-5 text-amber-900">
                {guide.safetyReminder}
                <span className="sr-only">Never share OTP, password, UPI PIN, CVV or full bank/card details.</span>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <ShieldAlert className="h-6 w-6 text-amber-700" />
              <CardTitle>Safe first-run checklist</CardTitle>
              <CardDescription>Finish these in your first session.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2">
                {guide.checklist.map((item) => (
                  <div key={item.id} className="flex items-start gap-2 rounded-2xl border border-slate-200 bg-white p-3 text-sm text-slate-700">
                    <CheckCircle2 className={`mt-0.5 h-4 w-4 shrink-0 ${item.done ? 'text-emerald-700' : 'text-slate-300'}`} />
                    <span className={item.done ? 'font-bold text-slate-900' : ''}>{item.label}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
