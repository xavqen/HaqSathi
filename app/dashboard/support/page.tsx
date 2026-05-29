import { db } from '@/lib/db'
import { requireUser } from '@/lib/auth/session'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SupportTicketForm } from '@/components/forms/support-ticket-form'

export const dynamic = 'force-dynamic'
export default async function Page() {
  const user = await requireUser()
  const tickets = await db.supportTicket.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' }, take: 25 }).catch(() => [])
  return <div><h1 className="text-3xl font-black">Support</h1><p className="mt-2 text-slate-600">Track bugs, billing questions or AI output issues.</p><div className="mt-6 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]"><SupportTicketForm /><Card><CardHeader><CardTitle>My tickets</CardTitle></CardHeader><CardContent className="space-y-3">{tickets.length === 0 ? <p className="text-slate-500">No ticket yet.</p> : tickets.map(t => <div key={t.id} className="rounded-xl border p-3"><b>{t.subject}</b><p className="text-sm text-slate-500">{t.category} · {t.status} · {t.createdAt.toDateString()}</p><p className="mt-2 text-sm text-slate-700">{t.message}</p></div>)}</CardContent></Card></div></div>
}
