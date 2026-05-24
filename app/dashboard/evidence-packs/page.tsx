import { db } from '@/lib/db'
import { requireUser } from '@/lib/auth/session'
import { EvidencePackForm } from '@/components/forms/evidence-pack-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const dynamic = 'force-dynamic'
export default async function EvidencePacksPage() {
  const user = await requireUser()
  const packs = await db.evidencePack.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' }, take: 20 }).catch(() => [])
  return <div><h1 className="text-4xl font-black">Evidence Packs</h1><p className="mt-2 text-slate-600">Proof files ko annexure order me organize karne ke liye cover note banao.</p><div className="mt-8"><EvidencePackForm /></div><Card className="mt-8"><CardHeader><CardTitle>Recent packs</CardTitle></CardHeader><CardContent>{packs.length === 0 ? <p className="text-slate-500">No evidence packs yet.</p> : <div className="space-y-3">{packs.map((pack) => <div key={pack.id} className="rounded-xl border p-4"><b>{pack.caseTitle}</b><p className="text-sm text-slate-600">{pack.category} · {pack.createdAt.toDateString()}</p><pre className="mt-3 max-h-40 overflow-auto whitespace-pre-wrap rounded-xl bg-slate-50 p-3 text-xs">{pack.coverNote}</pre></div>)}</div>}</CardContent></Card></div>
}
