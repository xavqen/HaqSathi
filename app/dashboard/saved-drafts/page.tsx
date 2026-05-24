import { db } from '@/lib/db'
import { requireUser } from '@/lib/auth/session'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const dynamic = 'force-dynamic'
type AnyJson = Record<string, unknown>

export default async function Page() {
  const user = await requireUser()
  const [schemes, checklists, chats] = await Promise.all([
    db.schemeSearch.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' }, take: 20 }),
    db.documentChecklist.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' }, take: 20 }),
    db.chatSession.findMany({ where: { userId: user.id }, orderBy: { updatedAt: 'desc' }, take: 10, include: { messages: { orderBy: { createdAt: 'desc' }, take: 1 } } })
  ])
  return <div><h1 className="text-3xl font-black">Saved Drafts</h1><p className="mt-2 text-slate-600">Scheme searches, document checklists aur chats.</p><div className="mt-6 grid gap-5 lg:grid-cols-3"><Card><CardHeader><CardTitle>Scheme searches</CardTitle></CardHeader><CardContent className="space-y-3">{schemes.length ? schemes.map(s => <div key={s.id} className="rounded-xl border p-3"><b>{s.purpose}</b><p className="text-sm text-slate-600">{s.state} · age {s.age}</p></div>) : <p className="text-slate-500">No saved scheme search.</p>}</CardContent></Card><Card><CardHeader><CardTitle>Document checklists</CardTitle></CardHeader><CardContent className="space-y-3">{checklists.length ? checklists.map(d => { const j=d.checklist as AnyJson; return <div key={d.id} className="rounded-xl border p-3"><b>{d.type}</b><p className="text-sm text-slate-600">{Array.isArray(j.requiredDocuments) ? j.requiredDocuments.length : 0} required docs</p></div> }) : <p className="text-slate-500">No saved checklist.</p>}</CardContent></Card><Card><CardHeader><CardTitle>Chats</CardTitle></CardHeader><CardContent className="space-y-3">{chats.length ? chats.map(c => <div key={c.id} className="rounded-xl border p-3"><b>{c.title}</b><p className="line-clamp-2 text-sm text-slate-600">{c.messages[0]?.content}</p></div>) : <p className="text-slate-500">No saved chats.</p>}</CardContent></Card></div></div>
}
