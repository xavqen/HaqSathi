'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { CopyButton } from '@/components/ui/copy-button'
import { LANGUAGE_OPTIONS } from '@/lib/i18n/languages'

type Result = {
  targetLanguage?: string
  tone?: string
  audience?: string
  localizedDraft?: string
  copyPack?: Record<string, string>
  safetyNotes?: string[]
  disclaimer?: string
  error?: string
}

export function LanguageDraftTranslatorForm() {
  const [result, setResult] = useState<Result | null>(null)
  const [loading, setLoading] = useState(false)

  async function submit(formData: FormData) {
    setLoading(true)
    setResult(null)
    const payload = Object.fromEntries(formData.entries())
    const res = await fetch('/api/tools/language-draft-translator', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    const data = await res.json().catch(() => ({ ok: false, error: 'Server JSON error' }))
    setLoading(false)
    setResult(data.ok ? data.result : { error: data.error || 'Language draft failed' })
  }

  return (
    <div className="rounded-[2rem] border bg-white p-4 shadow-soft sm:p-6">
      <form action={submit} className="grid gap-4 lg:grid-cols-2">
        <div className="grid gap-2">
          <Label>Target language</Label>
          <Select name="targetLanguage" defaultValue="ENGLISH" className="h-12 text-base">
            {LANGUAGE_OPTIONS.map((language) => <option key={language.code} value={language.code}>{language.label} — {language.nativeName}</option>)}
          </Select>
        </div>
        <div className="grid gap-2">
          <Label>Tone</Label>
          <Select name="tone" defaultValue="SIMPLE" className="h-12 text-base">
            <option value="SIMPLE">Simple public language</option>
            <option value="FORMAL">Formal email</option>
            <option value="FIRM">Firm but polite</option>
            <option value="WHATSAPP">WhatsApp short</option>
            <option value="CALL_SCRIPT">Customer-care call script</option>
          </Select>
        </div>
        <div className="grid gap-2 lg:col-span-2">
          <Label>Send to</Label>
          <Select name="audience" defaultValue="COMPANY_SUPPORT" className="h-12 text-base">
            <option value="COMPANY_SUPPORT">Company support</option>
            <option value="BANK">Bank grievance team</option>
            <option value="GOVERNMENT_OFFICE">Government office / scheme portal</option>
            <option value="CYBER_HELP">Cyber / UPI help</option>
            <option value="FAMILY_EXPLANATION">Family / local helper explanation</option>
          </Select>
        </div>
        <div className="grid gap-2 lg:col-span-2">
          <Label>Paste your draft / issue</Label>
          <Textarea name="sourceText" rows={8} className="text-base" placeholder="Paste complaint draft, refund issue, UPI issue, document problem..." required />
        </div>
        <div className="lg:col-span-2">
          <Button disabled={loading} size="lg" className="w-full rounded-2xl sm:w-auto">{loading ? 'Preparing...' : 'Create language-ready draft'}</Button>
        </div>
      </form>
      {result && <LanguageDraftResult result={result} />}
    </div>
  )
}

function LanguageDraftResult({ result }: { result: Result }) {
  if (result.error) return <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">{result.error}</div>
  const allText = [result.localizedDraft, ...(Object.values(result.copyPack || {}))].filter(Boolean).join('\n\n')
  return (
    <div className="mt-6 space-y-4 rounded-3xl bg-slate-50 p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div><h2 className="text-2xl font-black">Language-ready pack</h2><p className="text-sm text-slate-600">{result.targetLanguage} · {result.tone}</p></div>
        <CopyButton text={allText} label="Copy all" />
      </div>
      {result.localizedDraft && <div className="rounded-2xl bg-white p-4"><div className="mb-3 flex items-center justify-between gap-3"><b>Main draft</b><CopyButton text={result.localizedDraft} /></div><pre className="whitespace-pre-wrap font-sans text-sm leading-7 text-slate-700">{result.localizedDraft}</pre></div>}
      {result.copyPack && <div className="grid gap-3 sm:grid-cols-2">{Object.entries(result.copyPack).map(([key, value]) => <div className="rounded-2xl bg-white p-4" key={key}><div className="mb-3 flex items-center justify-between gap-2"><b className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</b><CopyButton text={value} /></div><p className="text-sm leading-6 text-slate-700">{value}</p></div>)}</div>}
      {Array.isArray(result.safetyNotes) && <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950"><b>Safety notes</b><ul className="mt-2 list-disc space-y-1 pl-5">{result.safetyNotes.map((item) => <li key={item}>{item}</li>)}</ul></div>}
      {result.disclaimer && <p className="text-xs text-slate-500">{result.disclaimer}</p>}
    </div>
  )
}
