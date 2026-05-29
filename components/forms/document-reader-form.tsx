'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { CopyButton } from '@/components/ui/copy-button'
import { LANGUAGE_OPTIONS } from '@/lib/i18n/languages'

type Result = {
  title?: string
  extractedFields?: Record<string, string>
  confidenceScore?: number
  autoFillHint?: string
  nextSteps?: string[]
  warnings?: string[]
  disclaimer?: string
  error?: string
}

export function DocumentReaderForm() {
  const [result, setResult] = useState<Result | null>(null)
  const [loading, setLoading] = useState(false)
  const [fileName, setFileName] = useState('')

  async function readFile(file?: File) {
    if (!file) return
    setFileName(file.name)
    const text = await file.text().catch(() => '')
    const box = document.querySelector<HTMLTextAreaElement>('textarea[name="rawText"]')
    if (box && text) box.value = text.slice(0, 12000)
  }

  async function submit(formData: FormData) {
    setLoading(true)
    setResult(null)
    const payload = Object.fromEntries(formData.entries())
    const res = await fetch('/api/tools/document-reader', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    const data = await res.json().catch(() => ({ ok: false, error: 'Server JSON error' }))
    setLoading(false)
    setResult(data.ok ? data.result : { error: data.error || 'Parse failed' })
  }

  return (
    <div className="rounded-[2rem] border bg-white p-4 shadow-soft sm:p-6">
      <form action={submit} className="grid gap-4 lg:grid-cols-2">
        <div className="grid gap-2">
          <Label>Document type</Label>
          <Select name="documentType" defaultValue="invoice-or-payment-proof" className="h-12 text-base">
            <option value="invoice-or-payment-proof">Invoice / payment proof</option>
            <option value="upi-sms-or-bank-message">UPI SMS / bank message</option>
            <option value="support-email-or-chat">Support email / chat</option>
            <option value="scholarship-document">Scholarship document</option>
            <option value="notice-or-letter">Notice / letter</option>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label>Source type</Label>
          <Select name="sourceType" defaultValue="TEXT" className="h-12 text-base">
            <option value="TEXT">Pasted text</option>
            <option value="SCREENSHOT_TEXT">Screenshot text</option>
            <option value="INVOICE_TEXT">Invoice text</option>
            <option value="BANK_SMS">Bank SMS</option>
            <option value="EMAIL_TEXT">Email text</option>
          </Select>
        </div>
        <div className="grid gap-2 lg:col-span-2">
          <Label>Optional text file upload</Label>
          <Input type="file" accept=".txt,.csv,.md,.json" className="h-12" onChange={(event) => readFile(event.target.files?.[0])} />
          {fileName && <p className="text-xs font-semibold text-emerald-700">Loaded: {fileName}</p>}
        </div>
        <div className="grid gap-2 lg:col-span-2">
          <Label>Paste invoice/SMS/email/chat text</Label>
          <Textarea name="rawText" rows={9} className="text-base" placeholder="Example: Paid ₹1299 to Flipkart, UTR 123..., date 12/05/2026, refund not received..." />
        </div>
        <div className="grid gap-2 lg:col-span-2">
          <Label>Output language</Label>
          <Select name="language" defaultValue="ENGLISH" className="h-12 text-base">
            {LANGUAGE_OPTIONS.map((language) => <option key={language.code} value={language.code}>{language.label} — {language.nativeName}</option>)}
          </Select>
        </div>
        <div className="lg:col-span-2">
          <Button disabled={loading} size="lg" className="w-full rounded-2xl sm:w-auto">{loading ? 'Reading...' : 'Extract details'}</Button>
        </div>
      </form>
      {result && <DocumentReaderResult result={result} />}
    </div>
  )
}

function DocumentReaderResult({ result }: { result: Result }) {
  if (result.error) return <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">{result.error}</div>
  const text = JSON.stringify(result.extractedFields || {}, null, 2)
  return (
    <div className="mt-6 space-y-4 rounded-3xl bg-slate-50 p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-black">Extracted details</h2>
          <p className="text-sm text-slate-600">Confidence: {result.confidenceScore || 0}/100</p>
        </div>
        <CopyButton text={text} />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {Object.entries(result.extractedFields || {}).map(([key, value]) => (
          <div key={key} className="rounded-2xl border bg-white p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{key}</p>
            <p className="mt-1 break-words text-base font-bold text-slate-900">{value}</p>
          </div>
        ))}
      </div>
      {result.autoFillHint && <p className="rounded-2xl bg-white p-4 text-sm font-semibold text-slate-700">{result.autoFillHint}</p>}
      {Array.isArray(result.warnings) && result.warnings.length > 0 && <List title="Warnings" items={result.warnings} tone="warn" />}
      {Array.isArray(result.nextSteps) && <List title="Next steps" items={result.nextSteps} />}
      {result.disclaimer && <p className="text-xs text-slate-500">{result.disclaimer}</p>}
    </div>
  )
}

function List({ title, items, tone }: { title: string; items: string[]; tone?: 'warn' }) {
  return <div className={`rounded-2xl p-4 ${tone === 'warn' ? 'border border-amber-200 bg-amber-50 text-amber-950' : 'bg-white text-slate-700'}`}><b>{title}</b><ul className="mt-3 list-disc space-y-2 pl-5 text-sm">{items.map((item) => <li key={item}>{item}</li>)}</ul></div>
}
