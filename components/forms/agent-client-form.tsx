'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Label } from '@/components/ui/label'

export function AgentClientForm() {
  const router = useRouter()
  const [message, setMessage] = useState('')

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setMessage('Saving...')
    const payload = Object.fromEntries(new FormData(e.currentTarget).entries())
    const res = await fetch('/api/agent-clients', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    setMessage(res.ok ? 'Client case saved.' : 'Save failed.')
    if (res.ok) e.currentTarget.reset()
    router.refresh()
  }

  return <form onSubmit={submit} className="grid gap-3"><div className="grid gap-2"><Label>Client name</Label><Input name="name" required /></div><div className="grid gap-2"><Label>Phone</Label><Input name="phone" inputMode="tel" /></div><div className="grid gap-2"><Label>Case type</Label><Input name="caseType" placeholder="Refund, UPI, document, scheme..." required /></div><div className="grid gap-2"><Label>Status</Label><Select name="caseStatus" defaultValue="OPEN"><option value="OPEN">OPEN</option><option value="FOLLOW_UP">FOLLOW_UP</option><option value="RESOLVED">RESOLVED</option><option value="CLOSED">CLOSED</option></Select></div><div className="grid gap-2"><Label>Notes</Label><Textarea name="notes" /></div><Button type="submit">Add Client Case</Button>{message && <p className="text-sm text-slate-500">{message}</p>}</form>
}
