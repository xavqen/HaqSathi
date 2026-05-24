'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

type ComplaintOption = { id: string; type: string; companyName: string }

export function CaseOutcomeForm({ complaints }: { complaints: ComplaintOption[] }) {
  const router = useRouter()
  const [message, setMessage] = useState('')
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setMessage('Saving...')
    const payload = Object.fromEntries(new FormData(e.currentTarget).entries())
    const res = await fetch('/api/case-outcomes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    setMessage(res.ok ? 'Outcome saved.' : 'Save failed.')
    if (res.ok) e.currentTarget.reset()
    router.refresh()
  }
  return <form onSubmit={submit} className="grid gap-3"><div className="grid gap-2"><Label>Linked complaint optional</Label><Select name="complaintId" defaultValue=""><option value="">No complaint link</option>{complaints.map((c) => <option key={c.id} value={c.id}>{c.companyName} · {c.type}</option>)}</Select></div><div className="grid gap-2"><Label>Outcome type</Label><Select name="outcomeType" defaultValue="REFUND_RECEIVED"><option>REFUND_RECEIVED</option><option>REPLACEMENT</option><option>CASE_RESOLVED</option><option>PARTIAL_RELIEF</option><option>REJECTED</option><option>WITHDRAWN</option></Select></div><div className="grid gap-2"><Label>Amount recovered optional</Label><Input name="amountRecovered" type="number" min="0" step="1" placeholder="999" /></div><div className="grid gap-2"><Label>Resolution date optional</Label><Input name="resolutionDate" type="date" /></div><div className="grid gap-2"><Label>Outcome summary</Label><Textarea name="summary" rows={4} placeholder="What happened finally?" required /></div><div className="grid gap-2"><Label>Learning optional</Label><Textarea name="learning" rows={3} placeholder="What helped? Which proof worked?" /></div><label className="flex items-center gap-2 text-sm"><input name="publicStory" type="checkbox" value="true" /> Allow anonymous success-story use</label><Button type="submit">Save Outcome</Button>{message && <p className="text-sm text-slate-500">{message}</p>}</form>
}
