'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

export function EscalationButton({ complaintId }: { complaintId: string }) {
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  async function generate() {
    setState('loading')
    const res = await fetch(`/api/complaints/${complaintId}/escalation`, { method: 'POST' })
    const data = await res.json().catch(() => ({ ok: false }))
    setState(data.ok ? 'done' : 'error')
  }
  return <Button type="button" variant="outline" className="mt-3 w-full" disabled={state === 'loading'} onClick={generate}>{state === 'loading' ? 'Generating...' : state === 'done' ? 'Plan saved' : state === 'error' ? 'Try again' : 'Generate escalation plan'}</Button>
}
