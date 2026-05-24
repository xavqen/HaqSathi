'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'

export function FeedbackForm({ entity, entityId }: { entity: string; entityId?: string }) {
  const [rating, setRating] = useState('5')
  const [comment, setComment] = useState('')
  const [message, setMessage] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setMessage('Saving...')
    const res = await fetch('/api/feedback', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ entity, entityId, rating, comment }) })
    setMessage(res.ok ? 'Thanks, feedback saved.' : 'Feedback failed.')
    if (res.ok) setComment('')
  }

  return <form onSubmit={submit} className="space-y-3 rounded-2xl border bg-white p-4"><b>Is this useful?</b><Select value={rating} onChange={(e) => setRating(e.target.value)}><option value="5">5 - Very useful</option><option value="4">4 - Useful</option><option value="3">3 - Okay</option><option value="2">2 - Needs improvement</option><option value="1">1 - Not useful</option></Select><Textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Optional feedback" rows={3} /><Button type="submit" size="sm">Send Feedback</Button>{message ? <p className="text-sm text-slate-500">{message}</p> : null}</form>
}
