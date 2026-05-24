import { db } from '@/lib/db'
import { requireUser } from '@/lib/auth/session'
import { FamilyProfileForm } from '@/components/forms/family-profile-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const dynamic = 'force-dynamic'
export default async function Page() {
  const user = await requireUser()
  const profiles = await db.familyProfile.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' } })
  return <div><h1 className="text-3xl font-black">Family Profiles</h1><p className="mt-2 text-slate-600">Family plan ke liye members save karo. Future me scheme/checklist prefill hoga.</p><div className="mt-6 grid gap-6 lg:grid-cols-[360px_1fr]"><Card><CardHeader><CardTitle>Add Member</CardTitle></CardHeader><CardContent><FamilyProfileForm /></CardContent></Card><Card><CardHeader><CardTitle>Saved Members</CardTitle></CardHeader><CardContent className="space-y-3">{profiles.length ? profiles.map(p => <div key={p.id} className="rounded-xl border p-4"><b>{p.name}</b><p className="text-sm text-slate-600">{p.relation}{p.age ? ` · age ${p.age}` : ''}</p>{p.notes && <p className="mt-2 text-sm">{p.notes}</p>}</div>) : <p className="text-slate-500">No family profiles yet.</p>}</CardContent></Card></div></div>
}
