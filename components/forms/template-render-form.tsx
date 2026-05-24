'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { CopyButton } from '@/components/ui/copy-button'

type Props = {
  slug: string
  variables: string[]
  isPremium: boolean
}

export function TemplateRenderForm({ slug, variables, isPremium }: Props) {
  const [inputs, setInputs] = useState<Record<string, string>>({})
  const [output, setOutput] = useState('')
  const [message, setMessage] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setMessage('Generating...')
    setOutput('')
    const res = await fetch('/api/templates/use', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slug, inputs }) })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      setMessage(data.error || 'Template generate failed.')
      return
    }
    setOutput(data.output)
    setMessage('Generated and saved in your template history.')
  }

  return <form onSubmit={submit} className="space-y-4">
    {isPremium ? <div className="rounded-2xl bg-amber-50 p-4 text-sm font-semibold text-amber-900">Premium template: Free user ke liye upgrade required.</div> : null}
    <div className="grid gap-4 md:grid-cols-2">
      {variables.map((name) => <div key={name} className="grid gap-2"><Label>{name}</Label><Input value={inputs[name] || ''} onChange={(e) => setInputs((prev) => ({ ...prev, [name]: e.target.value }))} placeholder={`Enter ${name}`} /></div>)}
    </div>
    <Button type="submit">Generate Template</Button>
    {message ? <p className="text-sm text-slate-500">{message}</p> : null}
    {output ? <div className="space-y-3 rounded-2xl border bg-white p-4"><div className="flex items-center justify-between gap-3"><b>Generated draft</b><CopyButton text={output} /></div><Textarea value={output} readOnly rows={10} /></div> : null}
  </form>
}
