import Link from 'next/link'
import { requireUser } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const dynamic = 'force-dynamic'

export default async function Page() {
  const user = await requireUser()
  const plans = await db.smartComplaintPlan.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' }, take: 20 }).catch(() => [])
  return (
    <div>
      <div className="rounded-3xl border bg-white p-6 shadow-soft">
        <p className="text-sm font-bold uppercase tracking-wider text-primary">Smart wizard history</p>
        <h1 className="mt-2 text-3xl font-black">Saved complaint action packs</h1>
        <p className="mt-2 max-w-2xl text-slate-600">Smart wizard se banaye gaye readiness reports, drafts and action plans yahan save hote hain.</p>
        <Link href="/tools/smart-complaint-wizard" className="mt-4 inline-flex rounded-2xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground">Build new pack</Link>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {plans.length === 0 ? <Card className="rounded-3xl"><CardHeader><CardTitle>No smart packs yet</CardTitle></CardHeader><CardContent><p className="text-sm text-slate-600">Start with the smart complaint wizard.</p></CardContent></Card> : plans.map((plan) => (
          <Card key={plan.id} className="rounded-3xl">
            <CardHeader><CardTitle>{plan.issueType.replaceAll('_', ' ')}</CardTitle></CardHeader>
            <CardContent>
              <div className="text-4xl font-black text-emerald-700">{plan.readinessScore}/100</div>
              <p className="mt-2 text-sm text-slate-600">{plan.companyName || 'No company'} · {plan.referenceId || 'No ref'} · {plan.urgency}</p>
              <p className="mt-2 text-xs text-slate-500">Created {plan.createdAt.toDateString()}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
