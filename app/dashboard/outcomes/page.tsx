import { db } from '@/lib/db'
import { requireUser } from '@/lib/auth/session'
import { CaseOutcomeForm } from '@/components/forms/case-outcome-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const dynamic = 'force-dynamic'
export default async function Page() {
  const user = await requireUser()
  const [outcomes, complaints] = await Promise.all([
    db.caseOutcome.findMany({ where: { userId: user.id }, include: { complaint: { select: { companyName: true, type: true } } }, orderBy: { createdAt: 'desc' }, take: 100 }),
    db.complaint.findMany({ where: { userId: user.id }, select: { id: true, type: true, companyName: true }, orderBy: { createdAt: 'desc' }, take: 50 })
  ])
  const totalRecovered = outcomes.reduce((sum, item) => sum + Number(item.amountRecovered || 0), 0)
  return <div><h1 className="text-3xl font-black">Case Outcomes</h1><p className="mt-2 text-slate-600">Resolved cases, refund recovered aur learning track karo.</p><div className="mt-6 grid gap-4 md:grid-cols-3"><Card><CardContent className="pt-6"><p className="text-sm text-slate-500">Total outcomes</p><p className="text-3xl font-black">{outcomes.length}</p></CardContent></Card><Card><CardContent className="pt-6"><p className="text-sm text-slate-500">Recovered amount</p><p className="text-3xl font-black">₹{totalRecovered.toLocaleString('en-IN')}</p></CardContent></Card><Card><CardContent className="pt-6"><p className="text-sm text-slate-500">Public stories</p><p className="text-3xl font-black">{outcomes.filter((x) => x.publicStory).length}</p></CardContent></Card></div><div className="mt-6 grid gap-6 lg:grid-cols-[400px_1fr]"><Card><CardHeader><CardTitle>Add Outcome</CardTitle></CardHeader><CardContent><CaseOutcomeForm complaints={complaints} /></CardContent></Card><Card><CardHeader><CardTitle>Saved Outcomes</CardTitle></CardHeader><CardContent className="space-y-3">{outcomes.length ? outcomes.map((outcome) => <div key={outcome.id} className="rounded-2xl border p-4"><div className="flex flex-wrap items-center gap-2"><b>{outcome.outcomeType.replaceAll('_', ' ')}</b><Badge>{outcome.publicStory ? 'Story allowed' : 'Private'}</Badge></div>{outcome.complaint && <p className="mt-1 text-sm text-slate-600">Linked: {outcome.complaint.companyName} · {outcome.complaint.type}</p>}<p className="mt-2 text-sm">{outcome.summary}</p>{outcome.learning && <p className="mt-2 rounded-xl bg-slate-50 p-3 text-sm"><b>Learning:</b> {outcome.learning}</p>}<p className="mt-2 text-xs text-slate-500">{outcome.resolutionDate ? outcome.resolutionDate.toLocaleDateString('en-IN') : outcome.createdAt.toLocaleDateString('en-IN')}</p></div>) : <p className="text-slate-500">No outcomes yet.</p>}</CardContent></Card></div></div>
}
