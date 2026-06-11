'use client'

import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function NewsletterSubscribeForm() {
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setStatus('')
    const form = new FormData(event.currentTarget)
    const payload = {
      email: String(form.get('email') || ''),
      consent: form.get('consent') === 'on',
      source: 'newsletter_page'
    }
    const response = await fetch('/api/newsletter/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    const data = await response.json().catch(() => null)
    setStatus(response.ok ? (data?.message || 'Newsletter request saved.') : (data?.error || 'Could not save newsletter request.'))
    setLoading(false)
  }

  return (
    <form onSubmit={submit} className="space-y-4 rounded-[1.5rem] border bg-white p-4 shadow-soft sm:p-6">
      <div className="grid gap-2">
        <Label htmlFor="newsletter-email">Email address</Label>
        <Input id="newsletter-email" name="email" type="email" placeholder="you@example.com" required />
      </div>
      <label className="flex items-start gap-3 rounded-2xl border bg-slate-50 p-3 text-sm leading-6 text-slate-700">
        <input name="consent" type="checkbox" required className="mt-1 h-4 w-4 shrink-0 accent-emerald-700" />
        <span>I agree to receive HaqSathi AI rights tips, product updates and safety education. I can unsubscribe anytime.</span>
      </label>
      <Button type="submit" className="w-full sm:w-auto" disabled={loading}>{loading ? 'Saving...' : 'Subscribe safely'}</Button>
      {status && <p className="rounded-2xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-800" aria-live="polite">{status}</p>}
    </form>
  )
}
