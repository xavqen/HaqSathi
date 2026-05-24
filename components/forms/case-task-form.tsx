'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

type ComplaintOption = { id: string; type: string; companyName: string }

export function CaseTaskForm({ complaints }: { complaints: ComplaintOption[] }) {
  const router = useRouter()
  const [message, setMessage] = useState('')
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setMessage('Saving...')
    const form = new FormData(e.currentTarget)
    const payload = Object.fromEntries(form.entries())
    const res = await fetch('/api/case-tasks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    setMessage(res.ok ? 'Task saved.' : 'Save failed.')
    if (res.ok) e.currentTarget.reset()
    router.refresh()
  }
  return <form onSubmit={submit} className="grid gap-3"><div className="grid gap-2"><Label>Task title</Label><Input name="title" placeholder="Follow up with bank after 7 days" required /></div><div className="grid gap-2"><Label>Linked complaint optional</Label><Select name="complaintId" defaultValue=""><option value="">No complaint link</option>{complaints.map((c) => <option key={c.id} value={c.id}>{c.companyName} · {c.type}</option>)}</Select></div><div className="grid gap-2"><Label>Priority</Label><Select name="priority" defaultValue="MEDIUM"><option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option><option value="URGENT">Urgent</option></Select></div><div className="grid gap-2"><Label>Due date</Label><Input name="dueDate" type="date" /></div><div className="grid gap-2"><Label>Notes</Label><Textarea name="notes" placeholder="What exactly needs to be done?" /></div><Button type="submit">Add Task</Button>{message && <p className="text-sm text-slate-500">{message}</p>}</form>
}
