'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

export function AiReviewForm({ tool = 'GENERAL', sourceId }: { tool?: string; sourceId?: string }) {
  const [message, setMessage] = useState('')
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const payload = { ...Object.fromEntries(form.entries()), tool, sourceId }
    const res = await fetch('/api/ai/reviews', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    setMessage(res.ok ? 'Feedback saved. Thank you.' : 'Feedback failed.')
    if (res.ok) e.currentTarget.reset()
  }
  return <form onSubmit={submit} className="grid gap-3 rounded-2xl border bg-white p-4"><p className="font-bold">AI output feedback</p><div><Label>Rating</Label><Input name="rating" type="number" min="1" max="5" defaultValue="5" /></div><div><Label>Issue type</Label><Select name="issueType" defaultValue="GOOD"><option value="GOOD">Good</option><option value="WRONG_FACT">Wrong fact</option><option value="UNSAFE">Unsafe</option><option value="CONFUSING">Confusing</option><option value="MISSING_STEPS">Missing steps</option><option value="OTHER">Other</option></Select></div><div><Label>Comment optional</Label><Textarea name="comment" placeholder="Kya improve karna chahiye?" /></div><Button type="submit" variant="outline">Submit Feedback</Button>{message && <p className="text-sm text-slate-500">{message}</p>}</form>
}
