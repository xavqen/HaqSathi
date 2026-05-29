import Link from 'next/link'
import { requireUser } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export const dynamic = 'force-dynamic'
export default async function Page() {
  const user = await requireUser()
  const plans = await db.followUpAutomation.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' }, take: 20 }).catch(() => [])
  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div><h1 className="text-3xl font-black">Follow-up automations</h1><p className="mt-2 text-slate-600">Complaint follow-up plan aur reminder schedule.</p></div>
        <Link href="/tools/follow-up-automation"><Button className="w-full rounded-2xl sm:w-auto">Create plan</Button></Link>
      </div>
      <div className="mt-6 grid gap-4">
        {plans.length === 0 && <Card><CardContent className="pt-6 text-slate-600">Abhi koi automation plan nahi.</CardContent></Card>}
        {plans.map((plan) => {
          const data = plan.plan as any
          return <Card key={plan.id}><CardHeader><CardTitle>{plan.caseTitle}</CardTitle></CardHeader><CardContent><p className="text-sm text-slate-600">{plan.channel} · {plan.status} · {plan.createdAt.toLocaleDateString()}</p><div className="mt-4 grid gap-2">{(data?.plan || []).slice(0, 5).map((step: any) => <div key={step.step} className="rounded-xl bg-slate-50 p-3 text-sm"><b>{step.dueDate}</b> — {step.label}</div>)}</div></CardContent></Card>
        })}
      </div>
    </div>
  )
}
