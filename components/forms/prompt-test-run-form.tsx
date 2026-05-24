'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export function PromptTestRunForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError(null)
    const form = new FormData(event.currentTarget)
    const payload = {
      name: String(form.get('name') || ''),
      tool: String(form.get('tool') || ''),
      input: String(form.get('input') || ''),
      output: String(form.get('output') || ''),
      score: Number(form.get('score') || 0),
      issueNotes: String(form.get('issueNotes') || '') || null
    }
    const res = await fetch('/api/admin/prompt-test-runs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    const data = await res.json().catch(() => ({ ok: false, error: 'Server response error' }))
    setLoading(false)
    if (!data.ok) return setError(data.error || 'Prompt test save nahi hua')
    router.refresh()
    event.currentTarget.reset()
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4 rounded-3xl border bg-white p-5 shadow-soft">
      <div className="grid gap-2"><Label>Test name</Label><Input name="name" placeholder="UPI fraud urgent safety prompt" required /></div>
      <div className="grid gap-2"><Label>Tool</Label><Input name="tool" placeholder="upi-help / complaint / scheme-finder" required /></div>
      <div className="grid gap-2"><Label>Input JSON/text</Label><Textarea name="input" rows={4} placeholder='{"issue":"UPI fraud", "amount":"5000"}' required /></div>
      <div className="grid gap-2"><Label>Output JSON/text</Label><Textarea name="output" rows={5} placeholder="Paste AI output for review" required /></div>
      <div className="grid gap-2"><Label>Score 0-100</Label><Input name="score" type="number" min="0" max="100" defaultValue="80" required /></div>
      <div className="grid gap-2"><Label>Issue notes</Label><Textarea name="issueNotes" placeholder="Hallucinated link, unclear disclaimer, missing step..." /></div>
      {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <Button disabled={loading}>{loading ? 'Saving...' : 'Save prompt test'}</Button>
    </form>
  )
}
