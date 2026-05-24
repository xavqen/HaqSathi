'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'

export function LanguagePreferenceForm({ initial }: { initial?: { primaryLanguage?: string; assistantTone?: string; readingLevel?: string } | null }) {
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  async function submit(formData: FormData) {
    setSaved(false)
    setError(null)
    const res = await fetch('/api/language/preference', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(Object.fromEntries(formData.entries())) })
    const data = await res.json().catch(() => ({ ok: false }))
    if (!data.ok) return setError(data.error || 'Save failed')
    setSaved(true)
  }
  return (
    <form action={submit} className="grid gap-4 rounded-3xl border bg-white p-6 shadow-soft md:grid-cols-3">
      <div><Label>Primary language</Label><Select name="primaryLanguage" defaultValue={initial?.primaryLanguage || 'HINGLISH'}><option value="HINGLISH">Hinglish</option><option value="HINDI">Hindi</option><option value="ENGLISH">English</option><option value="BENGALI">Bengali</option><option value="MARATHI">Marathi</option><option value="TAMIL">Tamil</option><option value="TELUGU">Telugu</option><option value="GUJARATI">Gujarati</option><option value="URDU">Urdu</option></Select></div>
      <div><Label>Assistant tone</Label><Select name="assistantTone" defaultValue={initial?.assistantTone || 'SIMPLE'}><option value="SIMPLE">Simple</option><option value="FORMAL">Formal</option><option value="FRIENDLY">Friendly</option><option value="STRICT">Strict complaint style</option></Select></div>
      <div><Label>Detail level</Label><Select name="readingLevel" defaultValue={initial?.readingLevel || 'EASY'}><option value="EASY">Easy</option><option value="NORMAL">Normal</option><option value="DETAILED">Detailed</option></Select></div>
      <div className="md:col-span-3"><Button>Save language</Button>{saved && <span className="ml-3 text-sm font-semibold text-emerald-700">Saved</span>}{error && <span className="ml-3 text-sm font-semibold text-red-700">{error}</span>}</div>
    </form>
  )
}
