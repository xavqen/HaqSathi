'use client'
import { useState } from 'react'
import { MessageSquare, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

export function FloatingFeedback() {
  const [open, setOpen] = useState(false)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [status, setStatus] = useState<string | null>(null)

  async function submit() {
    setStatus('Sending...')
    const res = await fetch('/api/feedback', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ entity: 'GLOBAL_WIDGET', rating, comment }) })
    setStatus(res.ok ? 'Thanks! Feedback saved.' : 'Could not save. Try again later.')
    if (res.ok) setComment('')
  }

  return (
    <div className="fixed bottom-5 right-5 z-30 hidden md:block">
      {open ? (
        <div className="w-[min(92vw,360px)] rounded-3xl border border-slate-200 bg-white p-4 shadow-2xl">
          <div className="flex items-center justify-between">
            <p className="font-bold">Feedback</p>
            <button onClick={() => setOpen(false)} aria-label="Close feedback"><X className="h-4 w-4" /></button>
          </div>
          <p className="mt-1 text-xs text-slate-500">Was this tool helpful? 1 low, 5 best.</p>
          <select className="mt-3 w-full rounded-xl border px-3 py-2 text-sm" value={rating} onChange={(e) => setRating(Number(e.target.value))}>{[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} star</option>)}</select>
          <Textarea className="mt-3" placeholder="Short feedback..." value={comment} onChange={(e) => setComment(e.target.value)} />
          <Button className="mt-3 w-full" onClick={submit}>Submit</Button>
          {status ? <p className="mt-2 text-xs text-slate-600">{status}</p> : null}
        </div>
      ) : (
        <button onClick={() => setOpen(true)} className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-2xl transition hover:scale-105" aria-label="Give feedback"><MessageSquare className="h-5 w-5" /></button>
      )}
    </div>
  )
}
