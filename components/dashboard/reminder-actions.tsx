'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export function ReminderActions({ id }: { id: string }) {
  const router = useRouter()

  async function setStatus(status: 'DONE' | 'CANCELLED') {
    await fetch(`/api/reminders/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) })
    router.refresh()
  }

  async function remove() {
    await fetch(`/api/reminders/${id}`, { method: 'DELETE' })
    router.refresh()
  }

  return <div className="flex flex-wrap gap-2"><Button size="sm" variant="outline" onClick={() => setStatus('DONE')}>Done</Button><Button size="sm" variant="outline" onClick={() => setStatus('CANCELLED')}>Cancel</Button><Button size="sm" variant="secondary" onClick={remove}>Delete</Button></div>
}
