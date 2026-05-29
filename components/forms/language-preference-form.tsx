'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { GLOBAL_LANGUAGE_OPTIONS, INDIAN_LANGUAGE_OPTIONS, getLanguageLabel } from '@/lib/i18n/languages'

type Initial = { primaryLanguage?: string; assistantTone?: string; readingLevel?: string } | null

export function LanguagePreferenceForm({ initial }: { initial?: Initial }) {
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const selected = initial?.primaryLanguage || 'ENGLISH'

  async function submit(formData: FormData) {
    setSaved(false)
    setError(null)
    const res = await fetch('/api/language/preference', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(Object.fromEntries(formData.entries())) })
    const data = await res.json().catch(() => ({ ok: false }))
    if (!data.ok) return setError(data.error || 'Save failed')
    setSaved(true)
  }

  return (
    <form action={submit} className="grid gap-5 rounded-3xl border bg-white p-5 shadow-soft sm:p-6 lg:grid-cols-3">
      <div className="grid gap-2 lg:col-span-3">
        <p className="text-sm font-bold text-slate-950">Current primary language: {getLanguageLabel(selected)}</p>
        <p className="text-sm text-slate-600">Default is English. You can switch to Indian regional languages or major global languages anytime from profile.</p>
      </div>
      <div className="grid gap-2 lg:col-span-2">
        <Label>Primary language</Label>
        <Select name="primaryLanguage" defaultValue={selected} className="h-12">
          <optgroup label="India major languages">
            {INDIAN_LANGUAGE_OPTIONS.map((language) => <option key={language.code} value={language.code}>{language.label} — {language.nativeName}</option>)}
          </optgroup>
          <optgroup label="World major languages">
            {GLOBAL_LANGUAGE_OPTIONS.map((language) => <option key={language.code} value={language.code}>{language.label} — {language.nativeName}</option>)}
          </optgroup>
        </Select>
      </div>
      <div className="grid gap-2">
        <Label>Assistant tone</Label>
        <Select name="assistantTone" defaultValue={initial?.assistantTone || 'SIMPLE'} className="h-12">
          <option value="SIMPLE">Simple</option>
          <option value="FORMAL">Formal</option>
          <option value="FRIENDLY">Friendly</option>
          <option value="STRICT">Strict complaint style</option>
        </Select>
      </div>
      <div className="grid gap-2">
        <Label>Detail level</Label>
        <Select name="readingLevel" defaultValue={initial?.readingLevel || 'EASY'} className="h-12">
          <option value="EASY">Easy</option>
          <option value="NORMAL">Normal</option>
          <option value="DETAILED">Detailed</option>
        </Select>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center lg:col-span-3">
        <Button>Save language</Button>
        {saved && <span className="text-sm font-semibold text-emerald-700">Saved. AI responses will now follow this language preference.</span>}
        {error && <span className="text-sm font-semibold text-red-700">{error}</span>}
      </div>
    </form>
  )
}
