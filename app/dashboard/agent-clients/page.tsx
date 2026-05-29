import { db } from '@/lib/db'
import { requireUser } from '@/lib/auth/session'
import { AgentClientForm } from '@/components/forms/agent-client-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const dynamic = 'force-dynamic'
export default async function Page() {
  const user = await requireUser()
  const clients = await db.agentClient.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' } })
  return <div><h1 className="text-3xl font-black">Agent Clients</h1><p className="mt-2 text-slate-600">Manage multiple client cases for local service agents.</p><div className="mt-6 grid gap-6 lg:grid-cols-[360px_1fr]"><Card><CardHeader><CardTitle>Add Client Case</CardTitle></CardHeader><CardContent><AgentClientForm /></CardContent></Card><Card><CardHeader><CardTitle>Client Cases</CardTitle></CardHeader><CardContent className="space-y-3">{clients.length ? clients.map(c => <div key={c.id} className="rounded-xl border p-4"><div className="flex flex-wrap justify-between gap-3"><b>{c.name}</b><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold">{c.caseStatus}</span></div><p className="text-sm text-slate-600">{c.caseType}{c.phone ? ` · ${c.phone}` : ''}</p>{c.notes && <p className="mt-2 text-sm">{c.notes}</p>}</div>) : <p className="text-slate-500">No client cases yet.</p>}</CardContent></Card></div></div>
}
