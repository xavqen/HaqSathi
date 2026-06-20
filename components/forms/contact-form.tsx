'use client'
import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

const categories = [
  ['GENERAL', 'General question'],
  ['PAYMENT', 'Payment / billing'],
  ['FRAUD_ABUSE', 'Fraud / abuse report'],
  ['ACCOUNT_LOGIN', 'Account / login'],
  ['DOCUMENT_VAULT', 'Document vault'],
  ['BUG', 'Bug report'],
  ['LEGAL_PRIVACY', 'Legal / privacy']
]

export function ContactForm() {
  const [status, setStatus] = useState('')
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const data = Object.fromEntries(new FormData(form))
    setStatus('Sending...')
    const res = await fetch('/api/contact', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ ...data, source: 'contact-page' }) })
    const payload = await res.json().catch(() => null)
    setStatus(res.ok ? (payload?.message || 'Message saved.') : (payload?.error || 'Error saving message.'))
    if (res.ok) form.reset()
  }
  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
        <p className="font-black text-amber-950">Never share OTP, UPI PIN, CVV, passwords or full card numbers.</p>
        <p className="mt-1">For UPI fraud or unauthorized transactions, call <b>1930</b>, report at <b>cybercrime.gov.in</b>, and inform your bank/UPI app immediately.</p>
      </div>
      <div className="grid gap-2"><Label>Name</Label><Input name="name" required /></div>
      <div className="grid gap-2"><Label>Email</Label><Input name="email" type="email" required /></div>
      <div className="grid gap-2">
        <Label>Category</Label>
        <select name="category" className="h-11 rounded-md border border-input bg-background px-3 text-sm shadow-sm" defaultValue="GENERAL">
          {categories.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </div>
      <div className="grid gap-2">
        <Label>Priority</Label>
        <select name="priority" className="h-11 rounded-md border border-input bg-background px-3 text-sm shadow-sm" defaultValue="NORMAL">
          <option value="NORMAL">Normal</option>
          <option value="URGENT">Urgent: payment, fraud, login or document issue</option>
        </select>
      </div>
      <div className="grid gap-2"><Label>Message</Label><Textarea name="message" required /></div>
      <Button>Send</Button>
      {status && <p className="text-sm font-semibold text-slate-700">{status}</p>}
    </form>
  )
}
