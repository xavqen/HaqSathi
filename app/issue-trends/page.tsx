import { db } from '@/lib/db'
import { IssueTrendForm } from '@/components/forms/issue-trend-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Issue Trends | HaqSathi AI', description: 'Public-safe issue trend signals for repeated complaint patterns.' }

export default async function IssueTrendsPage() {
  const trends = await db.issueTrendSignal.groupBy({ by: ['issueType', 'companyName', 'severity'], _count: { issueType: true }, orderBy: { _count: { issueType: 'desc' } }, take: 24 }).catch(() => [])
  return <main className="bg-slate-50"><section className="mx-auto max-w-7xl px-4 py-12"><p className="text-sm font-bold uppercase tracking-wider text-primary">Community intelligence</p><h1 className="mt-2 text-4xl font-black tracking-tight text-slate-950">Issue trends</h1><p className="mt-3 max-w-3xl text-slate-600">Identify repeated refund, UPI, bank, ecommerce and scheme problems using public-safe signals. Do not add personal data.</p><div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1fr]"><IssueTrendForm /><Card><CardHeader><CardTitle>Live trend signals</CardTitle></CardHeader><CardContent className="space-y-3">{trends.length ? trends.map((t:any, i:number)=><div key={i} className="rounded-2xl bg-white p-4 shadow-sm"><p className="font-bold">{t.issueType} · {t.companyName || 'Unknown company'}</p><p className="text-sm text-slate-600">Severity: {t.severity} · Reports: {t._count.issueType}</p></div>) : <p className="text-sm text-slate-600">No trend signals yet. Add first public-safe signal.</p>}</CardContent></Card></div></section></main>
}
