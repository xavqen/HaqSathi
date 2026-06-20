'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Download, MessageCircle, Save } from 'lucide-react'
import { complaintTypes } from '@/lib/constants'
import { complaintInputSchema, type ComplaintInput, type ComplaintOutput } from '@/lib/validators/complaint'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CopyButton } from '@/components/ui/copy-button'
import { VoiceInputAssist } from '@/components/forms/voice-input-assist'

type ApiResponse = { ok: true; draft: ComplaintOutput; savedId?: string; provider: string } | { ok: false; error: string; details?: unknown }

const VOICE_INPUT_ENABLED = false

export function ComplaintGenerator() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ComplaintOutput | null>(null)
  const [savedId, setSavedId] = useState<string | undefined>()
  const [error, setError] = useState<string | null>(null)

  const form = useForm<ComplaintInput>({
    resolver: zodResolver(complaintInputSchema),
    defaultValues: {
      type: 'Refund not received',
      companyName: '',
      transactionId: '',
      issueDate: '',
      amount: '',
      description: '',
      desiredResolution: 'Refund/status update chahiye',
      previousCommunication: ''
    }
  })

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const safeType = (complaintTypes as readonly string[]).includes(params.get('type') || '') ? params.get('type')! : 'Refund not received'
    const nextValues: ComplaintInput = {
      type: safeType as ComplaintInput['type'],
      companyName: params.get('companyName') || '',
      transactionId: params.get('transactionId') || '',
      issueDate: params.get('issueDate') || '',
      amount: params.get('amount') || '',
      description: params.get('description') || '',
      desiredResolution: params.get('desiredResolution') || 'Refund/status update chahiye',
      previousCommunication: params.get('previousCommunication') || ''
    }
    if (Array.from(params.keys()).length > 0) form.reset(nextValues)
  }, [form])

  async function onSubmit(values: ComplaintInput) {
    setLoading(true)
    setError(null)
    setResult(null)

    const res = await fetch('/api/ai/complaint', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values)
    })
    const data = (await res.json()) as ApiResponse

    if (!data.ok) {
      setError(data.error || 'Something went wrong')
    } else {
      setResult(data.draft)
      setSavedId(data.savedId)
    }
    setLoading(false)
  }

  function downloadText() {
    if (!result) return
    const text = Object.entries(result).map(([key, value]) => `${key.toUpperCase()}\n${Array.isArray(value) ? value.join('\n- ') : value}`).join('\n\n')
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'haqsathi-complaint-draft.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  function applyVoiceTranscript(text: string) {
    const current = form.getValues('description')
    const nextText = current?.trim() ? `${current.trim()}

${text}` : text
    form.setValue('description', nextText, { shouldDirty: true, shouldValidate: true })
  }

  const whatsAppText = encodeURIComponent(result?.shortComplaint || '')

  return (
    <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
      <Card>
        <CardHeader>
          <CardTitle>Complaint details</CardTitle>
          <CardDescription>Fill simple details and AI will create a copy-ready draft. Fields from OCR autofill can be applied automatically.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-2">
              <Label>Complaint type</Label>
              <Select {...form.register('type')}>
                {complaintTypes.map((type) => <option key={type} value={type}>{type}</option>)}
              </Select>
              {form.formState.errors.type && <p className="text-sm text-red-600">{form.formState.errors.type.message}</p>}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label>Company / Bank / App name</Label>
                <Input placeholder="Flipkart, SBI, PhonePe..." {...form.register('companyName')} />
                {form.formState.errors.companyName && <p className="text-sm text-red-600">{form.formState.errors.companyName.message}</p>}
              </div>
              <div className="grid gap-2">
                <Label>Order / Transaction ID</Label>
                <Input placeholder="Optional" {...form.register('transactionId')} />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label>Date</Label>
                <Input type="date" {...form.register('issueDate')} />
              </div>
              <div className="grid gap-2">
                <Label>Amount</Label>
                <Input inputMode="decimal" placeholder="999" {...form.register('amount')} />
              </div>
            </div>

            {VOICE_INPUT_ENABLED ? <VoiceInputAssist onApply={applyVoiceTranscript} /> : null}

            <div className="grid gap-2">
              <Label>Issue description</Label>
              <Textarea placeholder="Example: Return pickup is complete but the refund has not arrived yet..." {...form.register('description')} />
              {form.formState.errors.description && <p className="text-sm text-red-600">{form.formState.errors.description.message}</p>}
            </div>

            <div className="grid gap-2">
              <Label>Desired resolution</Label>
              <Input placeholder="Refund, replacement, written status..." {...form.register('desiredResolution')} />
              {form.formState.errors.desiredResolution && <p className="text-sm text-red-600">{form.formState.errors.desiredResolution.message}</p>}
            </div>

            <div className="grid gap-2">
              <Label>Previous communication</Label>
              <Textarea placeholder="Optional: What did support say?" {...form.register('previousCommunication')} />
            </div>

            <Button className="w-full" type="submit" disabled={loading}>{loading ? 'Generating...' : 'Generate Complaint Draft'}</Button>
            {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Generated draft</CardTitle>
          <CardDescription>{savedId ? `Saved ID: ${savedId}` : 'Draft will appear here.'}</CardDescription>
        </CardHeader>
        <CardContent>
          {!result ? (
            <div className="rounded-2xl border border-dashed p-8 text-center text-slate-500">Submit the form to get a short complaint, email draft, helpline format, follow-up and checklist.</div>
          ) : (
            <div className="space-y-5">
              <DraftBlock title="Short complaint" text={result.shortComplaint} />
              <DraftBlock title="Formal email" text={result.formalEmail} />
              <DraftBlock title="Consumer helpline format" text={result.consumerHelplineFormat} />
              <DraftBlock title="Company support message" text={result.companySupportMessage} />
              <DraftBlock title="Follow-up message" text={result.followUpMessage} />
              <DraftBlock title="Legal notice style draft" text={result.legalNoticeStyleDraft} />

              <div className="grid gap-4 md:grid-cols-2">
                <ListBlock title="Checklist" items={result.checklist} />
                <ListBlock title="Next steps" items={result.nextSteps} />
              </div>

              <div className="rounded-2xl bg-amber-50 p-4 text-sm text-amber-900">{result.disclaimer}</div>
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="outline" onClick={downloadText}><Download className="mr-2 h-4 w-4" />Download TXT</Button>
                <a className="inline-flex h-9 items-center justify-center rounded-xl border px-3 text-sm font-semibold hover:bg-slate-50" href={`https://wa.me/?text=${whatsAppText}`} target="_blank"><MessageCircle className="mr-2 h-4 w-4" />Share WhatsApp</a>
                <Button type="button" variant="secondary"><Save className="mr-2 h-4 w-4" />Saved automatically</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function DraftBlock({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl border bg-white p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="font-bold">{title}</h3>
        <CopyButton text={text} />
      </div>
      <pre className="whitespace-pre-wrap font-sans text-sm leading-7 text-slate-700">{text}</pre>
    </div>
  )
}

function ListBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <h3 className="font-bold">{title}</h3>
      <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-700">
        {items.map((item) => <li key={item}>{item}</li>)}
      </ul>
    </div>
  )
}
