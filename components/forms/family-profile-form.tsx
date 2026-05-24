'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

export function FamilyProfileForm() {
  const router = useRouter()
  const [message, setMessage] = useState('')

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setMessage('Saving...')
    const form = new FormData(e.currentTarget)
    const payload = Object.fromEntries(form.entries())
    const res = await fetch('/api/family-profiles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    setMessage(res.ok ? 'Family profile saved.' : 'Save failed.')
    if (res.ok) e.currentTarget.reset()
    router.refresh()
  }

  return <form onSubmit={submit} className="grid gap-3"><div className="grid gap-2"><Label>Name</Label><Input name="name" placeholder="Family member name" required /></div><div className="grid gap-2"><Label>Relation</Label><Input name="relation" placeholder="Father, Mother, Sister..." required /></div><div className="grid gap-2"><Label>Age</Label><Input name="age" type="number" min="0" max="120" /></div><div className="grid gap-2"><Label>Notes</Label><Textarea name="notes" placeholder="Scholarship, pension, KYC needs..." /></div><Button type="submit">Add Family Profile</Button>{message && <p className="text-sm text-slate-500">{message}</p>}</form>
}
