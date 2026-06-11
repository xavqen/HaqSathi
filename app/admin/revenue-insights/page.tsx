import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth/session'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const dynamic = 'force-dynamic'
export default async function Page() {
  await requireAdmin()
  const [users, payments, outcomes, usage] = await Promise.all([
    db.user.findMany({ select: { plan: true } }),
    db.paymentOrder.findMany({ select: { status: true, amount: true, plan: true } }),
    db.caseOutcome.findMany({ select: { amountRecovered: true, outcomeType: true } }).catch(() => []),
    db.aiUsageEvent.count().catch(() => 0)
  ])
  const revenue = payments.filter((x) => x.status === 'PAID').reduce((sum, x) => sum + x.amount, 0) / 100
  const recovered = outcomes.reduce((sum, x) => sum + Number(x.amountRecovered || 0), 0)
  const planCounts = users.reduce((acc, u: any) => {
    acc[u.plan] = (acc[u.plan] || 0) + 1;
    return acc;
  }, {} as Record<string, number>)
  return <div><h1 className="text-3xl font-black">Revenue Insights</h1><p className="mt-2 text-slate-600">SaaS monetization, usage aur user value ka quick view.</p><div className="mt-6 grid gap-4 md:grid-cols-4"><Card><CardContent className="pt-6"><p className="text-sm text-slate-500">Paid revenue</p><p className="text-3xl font-black">₹{revenue.toLocaleString('en-IN')}</p></CardContent></Card><Card><CardContent className="pt-6"><p className="text-sm text-slate-500">User recovered value</p><p className="text-3xl font-black">₹{recovered.toLocaleString('en-IN')}</p></CardContent></Card><Card><CardContent className="pt-6"><p className="text-sm text-slate-500">AI usage events</p><p className="text-3xl font-black">{usage}</p></CardContent></Card><Card><CardContent className="pt-6"><p className="text-sm text-slate-500">Paid users</p><p className="text-3xl font-black">{(planCounts.PRO || 0) + (planCounts.FAMILY || 0) + (planCounts.AGENT || 0)}</p></CardContent></Card></div><Card className="mt-6"><CardHeader><CardTitle>Plan Split</CardTitle></CardHeader><CardContent className="grid gap-3 md:grid-cols-4">{Object.entries({ FREE: 0, PRO: 0, FAMILY: 0, AGENT: 0, ...planCounts } as Record<string, number>).map(([plan, count]) => <div key={plan} className="rounded-2xl border p-4"><p className="text-sm text-slate-500">{plan}</p><p className="text-2xl font-black">{count}</p></div>)}</CardContent></Card></div>
}
