'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export function AgentInvoiceForm({ clients = [] }: { clients?: { id: string; name: string; caseType: string }[] }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError(null)
    const form = new FormData(event.currentTarget)
    const payload = {
      agentClientId: String(form.get('agentClientId') || '') || null,
      clientName: String(form.get('clientName') || ''),
      serviceName: String(form.get('serviceName') || ''),
      amount: Number(form.get('amount') || 0),
      notes: String(form.get('notes') || '') || null
    }
    const res = await fetch('/api/agent-invoices', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    const data = await res.json().catch(() => ({ ok: false, error: 'Server response error' }))
    setLoading(false)
    if (!data.ok) return setError(data.error || 'Invoice save nahi hua')
    router.refresh()
    event.currentTarget.reset()
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4 rounded-3xl border bg-white p-5 shadow-soft">
      <div className="grid gap-2">
        <Label>Saved client optional</Label>
        <select name="agentClientId" className="h-11 rounded-xl border px-3 text-sm">
          <option value="">Manual client</option>
          {clients.map((c) => <option key={c.id} value={c.id}>{c.name} · {c.caseType}</option>)}
        </select>
      </div>
      <div className="grid gap-2"><Label>Client name</Label><Input name="clientName" placeholder="Client/customer name" required /></div>
      <div className="grid gap-2"><Label>Service</Label><Input name="serviceName" placeholder="Complaint draft + filing support" required /></div>
      <div className="grid gap-2"><Label>Amount ₹</Label><Input name="amount" type="number" min="0" step="1" required /></div>
      <div className="grid gap-2"><Label>Notes</Label><Textarea name="notes" placeholder="Payment mode, work included, next follow-up..." /></div>
      {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <Button disabled={loading}>{loading ? 'Saving...' : 'Create invoice draft'}</Button>
    </form>
  )
}
