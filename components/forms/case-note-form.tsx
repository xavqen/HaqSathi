'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

type ComplaintOption = { id: string; type: string; companyName: string }

export function CaseNoteForm({ complaints }: { complaints: ComplaintOption[] }) {
  const router = useRouter()
  const [message, setMessage] = useState('')
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setMessage('Saving...')
    const form = new FormData(e.currentTarget)
    const payload = Object.fromEntries(form.entries())
    const res = await fetch('/api/case-notes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    setMessage(res.ok ? 'Note saved.' : 'Save failed.')
    if (res.ok) e.currentTarget.reset()
    router.refresh()
  }
  return <form onSubmit={submit} className="grid gap-3"><div className="grid gap-2"><Label>Title</Label><Input name="title" placeholder="Call summary, officer reply, evidence note..." required /></div><div className="grid gap-2"><Label>Linked complaint optional</Label><Select name="complaintId" defaultValue=""><option value="">No complaint link</option>{complaints.map((c) => <option key={c.id} value={c.id}>{c.companyName} · {c.type}</option>)}</Select></div><div className="grid gap-2"><Label>Visibility</Label><Select name="visibility" defaultValue="PRIVATE"><option value="PRIVATE">Private</option><option value="TEAM">Team/agent note</option></Select></div><div className="grid gap-2"><Label>Note</Label><Textarea name="body" placeholder="Write exact facts. Avoid OTP/PIN/password." rows={6} required /></div><Button type="submit">Save Note</Button>{message && <p className="text-sm text-slate-500">{message}</p>}</form>
}
