import { requireUser } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { CasePackageForm } from '@/components/forms/case-package-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const dynamic = 'force-dynamic'
export default async function CasePackagePage(){
  const user = await requireUser()
  const [complaints, packages] = await Promise.all([
    db.complaint.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' }, take: 25, select: { id: true, type: true, companyName: true } }).catch(() => []),
    db.casePackage.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' }, take: 25 }).catch(() => [])
  ])
  return <div className="grid gap-6"><div><h1 className="text-3xl font-black">Case package builder</h1><p className="mt-2 text-slate-600">Complaint draft, evidence index, timeline aur follow-up sections ek package me organize karo.</p></div><CasePackageForm complaints={complaints} /><Card><CardHeader><CardTitle>Saved packages</CardTitle></CardHeader><CardContent>{packages.length===0?<p className="text-slate-500">No package saved yet.</p>:<div className="space-y-3">{packages.map((p)=><div key={p.id} className="rounded-2xl border p-4"><b>{p.title}</b><p className="text-sm text-slate-600">Created {p.createdAt.toDateString()}</p><pre className="mt-3 max-h-40 overflow-auto rounded-xl bg-slate-50 p-3 text-xs">{JSON.stringify(p.sections, null, 2)}</pre></div>)}</div>}</CardContent></Card></div>
}
