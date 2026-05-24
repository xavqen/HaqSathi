'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

type ComplaintOption = { id: string; type: string; companyName: string }

export function CommunicationLogForm({ complaints }: { complaints: ComplaintOption[] }) {
  const router = useRouter()
  const [message, setMessage] = useState('')
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setMessage('Saving...')
    const payload = Object.fromEntries(new FormData(e.currentTarget).entries())
    const res = await fetch('/api/communications', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    setMessage(res.ok ? 'Communication saved.' : 'Save failed.')
    if (res.ok) e.currentTarget.reset()
    router.refresh()
  }
  return <form onSubmit={submit} className="grid gap-3"><div className="grid gap-2"><Label>Linked complaint optional</Label><Select name="complaintId" defaultValue=""><option value="">No complaint link</option>{complaints.map((c) => <option key={c.id} value={c.id}>{c.companyName} · {c.type}</option>)}</Select></div><div className="grid gap-2"><Label>Channel</Label><Select name="channel" defaultValue="CALL"><option>CALL</option><option>EMAIL</option><option>WHATSAPP</option><option>PORTAL</option><option>OFFICE_VISIT</option></Select></div><div className="grid gap-2"><Label>Direction</Label><Select name="direction" defaultValue="OUTBOUND"><option>OUTBOUND</option><option>INBOUND</option></Select></div><div className="grid gap-2"><Label>Recipient name</Label><Input name="recipientName" placeholder="Company support / bank officer / helpline" required /></div><div className="grid gap-2"><Label>Contact optional</Label><Input name="recipientContact" placeholder="Email, phone, portal ticket URL" /></div><div className="grid gap-2"><Label>Subject</Label><Input name="subject" placeholder="Refund follow-up / escalation call" required /></div><div className="grid gap-2"><Label>Message / call notes</Label><Textarea name="message" rows={5} required /></div><div className="grid gap-2"><Label>Status</Label><Select name="status" defaultValue="PLANNED"><option>PLANNED</option><option>SENT</option><option>REPLIED</option><option>FAILED</option><option>NO_RESPONSE</option></Select></div><div className="grid gap-2"><Label>Next follow-up optional</Label><Input name="nextFollowUpAt" type="datetime-local" /></div><Button type="submit">Save Communication</Button>{message && <p className="text-sm text-slate-500">{message}</p>}</form>
}
