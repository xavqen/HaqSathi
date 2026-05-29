'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Camera, Copy, FileImage, Wand2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { CopyButton } from '@/components/ui/copy-button'
import { LANGUAGE_OPTIONS } from '@/lib/i18n/languages'
import type { OcrAutofillResult } from '@/lib/validators/phase26'

type ApiResponse = { ok: true; result: OcrAutofillResult; provider: string } | { ok: false; error: string }

export function OcrAutofillForm() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<OcrAutofillResult | null>(null)
  const [provider, setProvider] = useState('')
  const [preview, setPreview] = useState('')
  const [fileName, setFileName] = useState('')

  function onFile(file?: File) {
    setPreview('')
    setFileName(file?.name || '')
    if (file?.type.startsWith('image/')) {
      const url = URL.createObjectURL(file)
      setPreview(url)
    }
  }

  async function submit(formData: FormData) {
    setLoading(true)
    setError('')
    setResult(null)
    const res = await fetch('/api/tools/ocr-autofill', { method: 'POST', body: formData })
    const data = (await res.json().catch(() => ({ ok: false, error: 'Server JSON error' }))) as ApiResponse
    setLoading(false)
    if (!data.ok) return setError(data.error || 'OCR failed')
    setResult(data.result)
    setProvider(data.provider)
  }

  const complaintHref = useMemo(() => {
    if (!result) return '/complaint'
    const params = new URLSearchParams()
    const add = (key: string, value?: string) => {
      if (value && value !== 'Not detected') params.set(key, value)
    }
    add('type', result.complaintType)
    add('companyName', result.companyName)
    add('transactionId', result.transactionId)
    add('amount', result.amount.replace(/[₹,\s]/g, ''))
    add('issueDate', result.issueDate)
    add('description', result.description)
    add('desiredResolution', result.desiredResolution)
    return `/complaint?${params.toString()}`
  }, [result])

  return (
    <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
      <div className="rounded-[2rem] border bg-white p-4 shadow-soft sm:p-6">
        <div className="mb-5 flex items-start gap-3">
          <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-700"><Camera className="h-6 w-6" /></div>
          <div>
            <h2 className="text-2xl font-black">Upload proof</h2>
            <p className="mt-1 text-sm text-slate-600">Image upload pe AI vision OCR try karega. API key nahi hai to notes/file name se safe fallback extraction hoga.</p>
          </div>
        </div>
        <form action={submit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label>Document type</Label>
              <Select name="documentType" defaultValue="PAYMENT_PROOF" className="h-12 text-base">
                <option value="PAYMENT_PROOF">Payment proof / UPI screenshot</option>
                <option value="INVOICE">Invoice / bill</option>
                <option value="ORDER_SCREENSHOT">Order screenshot</option>
                <option value="SUPPORT_CHAT">Support chat/email</option>
                <option value="BANK_STATEMENT">Bank statement snippet</option>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Output language</Label>
              <Select name="language" defaultValue="ENGLISH" className="h-12 text-base">
                {LANGUAGE_OPTIONS.map((language) => <option key={language.code} value={language.code}>{language.label} — {language.nativeName}</option>)}
              </Select>
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Upload image/PDF/text</Label>
            <Input name="file" type="file" accept="image/*,.pdf,.txt" className="h-12" onChange={(event) => onFile(event.target.files?.[0])} />
            {fileName && <p className="text-xs font-bold text-emerald-700">Selected: {fileName}</p>}
          </div>

          {preview && <div className="overflow-hidden rounded-3xl border bg-slate-50"><img src={preview} alt="Uploaded proof preview" className="max-h-[360px] w-full object-contain" /></div>}

          <div className="grid gap-2">
            <Label>Extra notes / visible text</Label>
            <Textarea name="rawNotes" rows={7} placeholder="Example: Flipkart order OD123..., paid ₹1299, UTR 123..., refund not received since 12/05/2026" />
            <p className="text-xs text-slate-500">PDF ya unclear image ho to visible text yahan paste karna accuracy badhata hai.</p>
          </div>

          <Button disabled={loading} size="lg" className="w-full rounded-2xl sm:w-auto"><Wand2 className="mr-2 h-4 w-4" />{loading ? 'Reading proof...' : 'OCR + autofill details'}</Button>
          {error && <p className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}
        </form>
      </div>

      <div className="rounded-[2rem] border bg-white p-4 shadow-soft sm:p-6">
        {!result ? (
          <div className="flex min-h-[420px] flex-col items-center justify-center rounded-3xl border border-dashed bg-slate-50 p-6 text-center">
            <FileImage className="h-12 w-12 text-slate-400" />
            <h2 className="mt-4 text-2xl font-black">Autofill result yahan dikhega</h2>
            <p className="mt-2 max-w-md text-sm text-slate-600">Company, transaction ID, amount, date, complaint type aur description extract karke complaint generator me one-click bhej sakte ho.</p>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-wider text-emerald-700">Provider: {provider}</p>
                <h2 className="text-3xl font-black">Complaint autofill ready</h2>
                <p className="text-sm text-slate-600">Confidence: {result.confidenceScore}/100</p>
              </div>
              <Link href={complaintHref} className="inline-flex h-11 items-center justify-center rounded-2xl bg-primary px-5 text-sm font-bold text-primary-foreground hover:bg-primary/90">Open complaint form →</Link>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Company" value={result.companyName} />
              <Field label="Transaction / Order ID" value={result.transactionId} />
              <Field label="Amount" value={result.amount} />
              <Field label="Issue date" value={result.issueDate} />
              <Field label="Complaint type" value={result.complaintType} />
              <Field label="Resolution" value={result.desiredResolution} />
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="mb-2 flex items-center justify-between gap-3"><b>Description</b><CopyButton text={result.description} /></div>
              <p className="text-sm leading-7 text-slate-700">{result.description}</p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="mb-2 flex items-center justify-between gap-3"><b>Evidence summary</b><Copy className="h-4 w-4 text-slate-400" /></div>
              <p className="text-sm leading-7 text-slate-700">{result.evidenceSummary}</p>
            </div>

            {result.warnings.length > 0 && <List title="Warnings" items={result.warnings} tone="warn" />}
            <List title="Next steps" items={result.nextSteps} />
            <p className="rounded-2xl border bg-amber-50 p-4 text-xs leading-6 text-amber-900">{result.disclaimer}</p>
          </div>
        )}
      </div>
    </div>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl border bg-slate-50 p-4"><p className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p><p className="mt-1 break-words text-base font-black text-slate-900">{value || 'Not detected'}</p></div>
}

function List({ title, items, tone }: { title: string; items: string[]; tone?: 'warn' }) {
  return <div className={`rounded-2xl p-4 ${tone === 'warn' ? 'border border-amber-200 bg-amber-50 text-amber-950' : 'bg-slate-50 text-slate-700'}`}><b>{title}</b><ul className="mt-3 list-disc space-y-2 pl-5 text-sm">{items.map((item) => <li key={item}>{item}</li>)}</ul></div>
}
