import { requireUser } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { AgentInvoiceForm } from '@/components/forms/agent-invoice-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const dynamic = 'force-dynamic'
export default async function AgentInvoicesPage() {
  const user = await requireUser()
  const [clients, invoices] = await Promise.all([
    db.agentClient.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' }, select: { id: true, name: true, caseType: true } }).catch(() => []),
    db.agentInvoice.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' } }).catch(() => [])
  ])
  const total = invoices.reduce((sum, invoice) => sum + Number(invoice.amount), 0)
  return (
    <div className="grid gap-6">
      <div><h1 className="text-3xl font-black tracking-tight">Agent invoices</h1><p className="mt-2 text-slate-600">Cyber cafe/local service agents ke liye simple invoice tracker.</p></div>
      <div className="grid gap-4 md:grid-cols-3"><Card><CardHeader><CardTitle>Total invoices</CardTitle></CardHeader><CardContent><p className="text-3xl font-black">{invoices.length}</p></CardContent></Card><Card><CardHeader><CardTitle>Total value</CardTitle></CardHeader><CardContent><p className="text-3xl font-black">₹{total.toLocaleString('en-IN')}</p></CardContent></Card><Card><CardHeader><CardTitle>Clients</CardTitle></CardHeader><CardContent><p className="text-3xl font-black">{clients.length}</p></CardContent></Card></div>
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]"><AgentInvoiceForm clients={clients} /><div className="grid gap-4">{invoices.map((invoice) => <Card key={invoice.id}><CardHeader><div className="flex items-center justify-between gap-3"><CardTitle>{invoice.clientName}</CardTitle><Badge>{invoice.status}</Badge></div></CardHeader><CardContent><p className="text-sm text-slate-600"><b>Service:</b> {invoice.serviceName}</p><p className="mt-1 text-sm text-slate-600"><b>Amount:</b> ₹{Number(invoice.amount).toLocaleString('en-IN')}</p>{invoice.notes && <p className="mt-3 rounded-xl bg-slate-50 p-3 text-sm">{invoice.notes}</p>}</CardContent></Card>)}{invoices.length === 0 && <p className="rounded-2xl border bg-white p-5 text-sm text-slate-600">No invoice yet.</p>}</div></div>
    </div>
  )
}
