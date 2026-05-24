'use client'
import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export function ContactForm() {
  const [status, setStatus] = useState('')
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); const form = new FormData(e.currentTarget); const res = await fetch('/api/contact', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(Object.fromEntries(form))}); setStatus(res.ok ? 'Message saved.' : 'Error saving message.')
  }
  return <form onSubmit={submit} className="space-y-4"><div className="grid gap-2"><Label>Name</Label><Input name="name" required /></div><div className="grid gap-2"><Label>Email</Label><Input name="email" type="email" required /></div><div className="grid gap-2"><Label>Message</Label><Textarea name="message" required /></div><Button>Send</Button>{status && <p className="text-sm text-slate-600">{status}</p>}</form>
}
