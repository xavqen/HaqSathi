'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export function SlaTrackForm({ complaints = [] }: { complaints?: { id: string; companyName: string; type: string }[] }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError(null)
    const form = new FormData(event.currentTarget)
    const payload = {
      complaintId: String(form.get('complaintId') || '') || null,
      title: String(form.get('title') || ''),
      stage: String(form.get('stage') || ''),
      targetDate: String(form.get('targetDate') || ''),
      nextAction: String(form.get('nextAction') || ''),
      riskNote: String(form.get('riskNote') || '') || null
    }
    const res = await fetch('/api/sla-tracks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    const data = await res.json().catch(() => ({ ok: false, error: 'Server response error' }))
    setLoading(false)
    if (!data.ok) return setError(data.error || 'SLA track save nahi hua')
    router.refresh()
    event.currentTarget.reset()
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4 rounded-3xl border bg-white p-5 shadow-soft">
      <div className="grid gap-2">
        <Label>Related complaint optional</Label>
        <select name="complaintId" className="h-11 rounded-xl border px-3 text-sm">
          <option value="">No complaint link</option>
          {complaints.map((c) => <option key={c.id} value={c.id}>{c.companyName} · {c.type}</option>)}
        </select>
      </div>
      <div className="grid gap-2"><Label>Tracker title</Label><Input name="title" placeholder="Bank complaint 30-day deadline" required /></div>
      <div className="grid gap-2"><Label>Stage</Label><Input name="stage" placeholder="Company support / Bank nodal / Ombudsman" required /></div>
      <div className="grid gap-2"><Label>Target date</Label><Input name="targetDate" type="date" required /></div>
      <div className="grid gap-2"><Label>Next action</Label><Textarea name="nextAction" placeholder="Is date tak response na mile to ye action lena hai..." required /></div>
      <div className="grid gap-2"><Label>Risk note optional</Label><Textarea name="riskNote" placeholder="Evidence missing, deadline close, payment proof needed..." /></div>
      {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <Button disabled={loading}>{loading ? 'Saving...' : 'Save SLA tracker'}</Button>
    </form>
  )
}
