import { requireUser } from '@/lib/auth/session'
import { getMonthlyUsageSummary } from '@/lib/billing/usage'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const dynamic = 'force-dynamic'
export default async function Page() {
  const user = await requireUser()
  const rows = await getMonthlyUsageSummary(user.id)
  const complaintCount = rows.find(r => r.tool === 'complaint')?.count || 0
  const limit = user.plan === 'FREE' ? 3 : 'Unlimited'
  return <div><h1 className="text-3xl font-black">Usage</h1><p className="mt-2 text-slate-600">Current plan: <b>{user.plan}</b></p><div className="mt-6 grid gap-5 md:grid-cols-3"><Card><CardHeader><CardTitle>Complaint drafts</CardTitle></CardHeader><CardContent><div className="text-3xl font-black">{complaintCount}</div><p className="text-sm text-slate-500">Monthly limit: {limit}</p></CardContent></Card><Card><CardHeader><CardTitle>Remaining</CardTitle></CardHeader><CardContent><div className="text-3xl font-black">{user.plan === 'FREE' ? Math.max(0, 3 - complaintCount) : '∞'}</div><p className="text-sm text-slate-500">Free plan quota applies only to generated complaint drafts.</p></CardContent></Card></div><Card className="mt-6"><CardHeader><CardTitle>All AI usage this month</CardTitle></CardHeader><CardContent>{rows.length === 0 ? <p className="text-slate-500">No AI usage yet.</p> : <div className="space-y-2">{rows.map(r => <div key={r.tool} className="flex justify-between rounded-xl border p-3"><span>{r.tool}</span><b>{r.count}</b></div>)}</div>}</CardContent></Card></div>
}
