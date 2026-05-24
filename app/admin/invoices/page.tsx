import { requireAdmin } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const dynamic = 'force-dynamic'
export default async function AdminInvoicesPage() {
  await requireAdmin()
  const invoices = await db.agentInvoice.findMany({ orderBy: { createdAt: 'desc' }, take: 50, include: { user: { select: { email: true, name: true } } } }).catch(() => [])
  const total = invoices.reduce((sum, invoice) => sum + Number(invoice.amount), 0)
  return <div className="grid gap-6"><div><h1 className="text-3xl font-black tracking-tight">Agent invoice monitor</h1><p className="mt-2 text-slate-600">Agent plan users ke service invoice activity ko monitor karo.</p></div><Card><CardHeader><CardTitle>Total tracked value</CardTitle></CardHeader><CardContent><p className="text-4xl font-black">₹{total.toLocaleString('en-IN')}</p></CardContent></Card><div className="grid gap-4">{invoices.map((invoice) => <Card key={invoice.id}><CardHeader><div className="flex items-center justify-between gap-3"><CardTitle>{invoice.clientName}</CardTitle><Badge>{invoice.status}</Badge></div></CardHeader><CardContent><p className="text-sm text-slate-600"><b>Agent:</b> {invoice.user.name || invoice.user.email}</p><p className="text-sm text-slate-600"><b>Service:</b> {invoice.serviceName}</p><p className="text-sm text-slate-600"><b>Amount:</b> ₹{Number(invoice.amount).toLocaleString('en-IN')}</p></CardContent></Card>)}{invoices.length === 0 && <p className="rounded-2xl border bg-white p-5 text-sm text-slate-600">No invoices yet.</p>}</div></div>
}
