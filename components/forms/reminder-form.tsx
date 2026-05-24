'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function ReminderForm() {
  const router = useRouter()
  const [title, setTitle] = useState('Follow up complaint')
  const [dueDate, setDueDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit() {
    setLoading(true)
    setError(null)
    const res = await fetch('/api/reminders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title, dueDate }) })
    const data = await res.json()
    setLoading(false)
    if (!data.ok) return setError(data.error || 'Reminder save failed')
    setTitle('Follow up complaint')
    setDueDate('')
    router.refresh()
  }

  return <div className="rounded-2xl border bg-white p-4"><div className="grid gap-4 md:grid-cols-[1fr_220px_auto]"><div className="grid gap-2"><Label>Reminder title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} /></div><div className="grid gap-2"><Label>Due date</Label><Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} /></div><div className="flex items-end"><Button onClick={submit} disabled={loading || !dueDate}>{loading ? 'Saving...' : 'Add reminder'}</Button></div></div>{error && <p className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}</div>
}
