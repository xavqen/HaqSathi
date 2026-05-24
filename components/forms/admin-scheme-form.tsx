'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

type Initial = { id?: string; title?: string; slug?: string; state?: string; purpose?: string; eligibility?: string; officialLink?: string | null; documents?: unknown; applySteps?: unknown }

function lines(value: unknown) {
  return Array.isArray(value) ? value.join('\n') : ''
}

export function AdminSchemeForm({ initial }: { initial?: Initial }) {
  const router = useRouter()
  const [title, setTitle] = useState(initial?.title || '')
  const [slug, setSlug] = useState(initial?.slug || '')
  const [state, setState] = useState(initial?.state || '')
  const [purpose, setPurpose] = useState(initial?.purpose || '')
  const [eligibility, setEligibility] = useState(initial?.eligibility || '')
  const [documents, setDocuments] = useState(lines(initial?.documents))
  const [applySteps, setApplySteps] = useState(lines(initial?.applySteps))
  const [officialLink, setOfficialLink] = useState(initial?.officialLink || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function save() {
    setLoading(true)
    setError(null)
    const res = await fetch(initial?.id ? `/api/admin/schemes/${initial.id}` : '/api/admin/schemes', {
      method: initial?.id ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, slug, state, purpose, eligibility, documents: documents.split('\n').filter(Boolean), applySteps: applySteps.split('\n').filter(Boolean), officialLink })
    })
    const data = await res.json()
    setLoading(false)
    if (!data.ok) return setError(data.error || 'Save failed')
    router.push('/admin/schemes')
    router.refresh()
  }

  return <div className="grid gap-4 rounded-3xl border bg-white p-5 shadow-soft"><div className="grid gap-4 md:grid-cols-2"><Field label="Title" value={title} setValue={setTitle} /><Field label="Slug" value={slug} setValue={setSlug} /><Field label="State" value={state} setValue={setState} /><Field label="Purpose" value={purpose} setValue={setPurpose} /></div><div className="grid gap-2"><Label>Eligibility</Label><Textarea value={eligibility} onChange={(e) => setEligibility(e.target.value)} /></div><div className="grid gap-4 md:grid-cols-2"><div className="grid gap-2"><Label>Documents one per line</Label><Textarea value={documents} onChange={(e) => setDocuments(e.target.value)} /></div><div className="grid gap-2"><Label>Apply steps one per line</Label><Textarea value={applySteps} onChange={(e) => setApplySteps(e.target.value)} /></div></div><Field label="Official link" value={officialLink} setValue={setOfficialLink} />{error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}<Button onClick={save} disabled={loading}>{loading ? 'Saving...' : 'Save scheme'}</Button></div>
}

function Field({ label, value, setValue }: { label: string; value: string; setValue: (v: string) => void }) {
  return <div className="grid gap-2"><Label>{label}</Label><Input value={value} onChange={(e) => setValue(e.target.value)} /></div>
}
