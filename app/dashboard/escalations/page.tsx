import { requireUser } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Escalation Plans' }

export default async function EscalationsPage() {
  const user = await requireUser()
  const plans = await db.escalationPlan.findMany({ where: { userId: user.id }, include: { complaint: { select: { companyName: true, type: true } } }, orderBy: { createdAt: 'desc' } }).catch(() => [])
  return <div><h1 className="text-3xl font-black">Escalation Plans</h1><p className="mt-2 text-slate-600">Generated follow-up/escalation plans.</p><div className="mt-6 grid gap-4">{plans.length ? plans.map((plan) => { const steps = Array.isArray(plan.generatedPlan) ? plan.generatedPlan as any[] : []; return <Card key={plan.id}><CardHeader><CardTitle>{plan.complaint?.companyName || 'Case'} · {plan.status}</CardTitle></CardHeader><CardContent><p className="font-bold">Next: {plan.nextAction}</p><div className="mt-4 grid gap-2">{steps.map((s) => <div key={s.order} className="rounded-xl bg-slate-50 p-3 text-sm"><b>{s.order}. {s.title}</b><p>{s.action}</p><p className="text-xs text-slate-500">Due {String(s.dueDate).slice(0, 10)} · {s.channel}</p></div>)}</div></CardContent></Card> }) : <Card><CardContent className="p-6">No escalation plans yet. Open Case Center and create one after saving a complaint.</CardContent></Card>}</div></div>
}
