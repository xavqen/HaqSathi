'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export function SavedLinkForm() {
  const [message, setMessage] = useState<string | null>(null)
  async function submit(formData: FormData) {
    setMessage(null)
    const res = await fetch('/api/saved-links', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(Object.fromEntries(formData.entries())) })
    const data = await res.json().catch(() => ({ ok: false, error: 'Request failed' }))
    setMessage(data.ok ? 'Saved.' : data.error || 'Failed')
  }
  return <form action={submit} className="grid gap-4 rounded-3xl border bg-white p-6 shadow-soft md:grid-cols-2"><div><Label>Title</Label><Input name="title" required /></div><div><Label>Official URL</Label><Input name="url" type="url" required /></div><div><Label>Category</Label><Input name="category" placeholder="Bank, Scheme, Consumer" required /></div><div><Label>State optional</Label><Input name="state" /></div><div className="md:col-span-2"><Label>Notes</Label><Textarea name="notes" rows={3} /></div><div className="md:col-span-2"><Button>Save Link</Button>{message && <span className="ml-3 text-sm text-slate-600">{message}</span>}</div></form>
}
