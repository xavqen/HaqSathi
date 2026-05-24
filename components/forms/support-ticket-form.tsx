'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

export function SupportTicketForm() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  async function submit(formData: FormData) {
    setLoading(true)
    setMessage(null)
    const payload = Object.fromEntries(formData.entries())
    const res = await fetch('/api/support/tickets', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    const data = await res.json()
    setLoading(false)
    setMessage(data.ok ? 'Ticket saved. Admin dashboard me dikhega.' : data.error || 'Failed')
  }

  return <form action={submit} className="space-y-4 rounded-3xl border bg-white p-5 shadow-soft">
    <div className="grid gap-2"><Label>Subject</Label><Input name="subject" placeholder="Example: PDF download not working" required /></div>
    <div className="grid gap-2"><Label>Category</Label><Select name="category"><option value="ACCOUNT">Account</option><option value="BILLING">Billing</option><option value="BUG">Bug</option><option value="AI_OUTPUT">AI output</option><option value="OTHER">Other</option></Select></div>
    <div className="grid gap-2"><Label>Message</Label><Textarea name="message" placeholder="Issue clearly likho..." required /></div>
    <Button disabled={loading}>{loading ? 'Saving...' : 'Create Ticket'}</Button>
    {message && <p className="text-sm text-slate-600">{message}</p>}
  </form>
}
