import { requireUser } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Risk Reports' }
export default async function Page() {
  const user = await requireUser()
  const reports = await db.riskAssessment.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' }, take: 30 }).catch(() => [])
  return <div><h1 className="text-3xl font-black">Risk Reports</h1><p className="mt-2 text-slate-600">Aapke saved risk assessments.</p><div className="mt-6 grid gap-4">{reports.length ? reports.map((r) => { const result: any = r.result; return <Card key={r.id}><CardHeader><CardTitle>{r.riskLevel} · {r.tool}</CardTitle></CardHeader><CardContent><p className="text-sm text-slate-600">{r.createdAt.toLocaleString()}</p><ul className="mt-3 list-disc pl-5 text-sm">{result.actions?.map((a: string) => <li key={a}>{a}</li>)}</ul></CardContent></Card> }) : <Card><CardContent className="p-6">No risk reports yet.</CardContent></Card>}</div></div>
}
