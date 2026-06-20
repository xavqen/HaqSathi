import { db } from '@/lib/db'
import { requireUser } from '@/lib/auth/session'
import { IssueTrendForm } from '@/components/forms/issue-trend-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'My Issue Trends' }

export default async function Page() {
  const user = await requireUser()
  const items = await db.issueTrendSignal.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' }, take: 20 }).catch(() => [])
  return <main><section className="space-y-6"><div><p className="text-sm font-bold uppercase tracking-wider text-primary">Community intelligence</p><h1 className="text-3xl font-black text-slate-950">My trend signals</h1><p className="mt-2 text-slate-600">Repeated issue patterns report karo without personal data.</p></div><IssueTrendForm /><div className="grid gap-4">{items.map((item:any)=><Card key={item.id}><CardHeader><CardTitle>{item.issueType} · {item.companyName || 'Unknown company'}</CardTitle></CardHeader><CardContent><p className="text-sm text-slate-600">{item.summary}</p><p className="mt-2 text-xs text-slate-500">{item.severity} · {item.state || 'No state'} · {item.createdAt.toLocaleDateString('en-IN')}</p></CardContent></Card>)}</div></section></main>
}
