'use client'

import { useState } from 'react'
import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { AdvancedToolResult } from '@/components/forms/advanced-tool-result'


export function LegalNoticeForm() {
  const [result, setResult] = useState<Record<string, any> | null>(null)
  const [error, setError] = useState<string | null>(null)
  async function submit(formData: FormData) {
    setError(null)
    const res = await fetch('/api/tools/legal-notice', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(Object.fromEntries(formData.entries())) })
    const data = await res.json().catch(() => ({ ok: false, error: 'Request failed' }))
    if (!data.ok) return setError(data.error || 'Failed')
    setResult(data.result)
  }
  return <ToolForm title="Legal notice style draft" error={error} result={result} action={submit} fields={<>
    <Field name="recipientName" label="Company/person name" required />
    <Field name="recipientAddress" label="Address/email optional" />
    <Field name="senderName" label="Your name" required />
    <Field name="senderAddress" label="Your address optional" />
    <Field name="issueType" label="Issue type" placeholder="Refund delay, defective product" required />
    <Field name="referenceId" label="Order/transaction ID" />
    <Field name="amount" label="Amount" />
    <Field name="issueDate" label="Issue date" type="date" />
    <Area name="facts" label="Facts of matter" placeholder="What happened? Add date-wise simple facts." required />
    <Area name="demand" label="Resolution demand" placeholder="Refund/replacement/written apology etc." required />
    <Field name="responseDays" label="Response days" placeholder="15" />
    <div><Label>Language</Label><Select name="language" defaultValue="HINGLISH"><option value="HINGLISH">Hinglish</option><option value="HINDI">Hindi</option><option value="ENGLISH">English</option></Select></div>
  </>} />
}

function ToolForm({ title, error, result, action, fields }: { title: string; error: string | null; result: Record<string, any> | null; action: (formData: FormData) => void | Promise<void>; fields: ReactNode }) { return <div className="rounded-3xl border bg-white p-6 shadow-soft"><h2 className="text-2xl font-black">{title}</h2><form action={action} className="mt-5 grid gap-4 md:grid-cols-2">{fields}<div className="md:col-span-2"><Button>Generate</Button></div></form>{error && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}{result && <AdvancedToolResult result={result} />}</div> }
function Field(props: { name: string; label: string; placeholder?: string; type?: string; required?: boolean }) { return <div><Label>{props.label}</Label><Input name={props.name} type={props.type || 'text'} placeholder={props.placeholder} required={props.required} /></div> }
function Area(props: { name: string; label: string; placeholder?: string; required?: boolean }) { return <div className="md:col-span-2"><Label>{props.label}</Label><Textarea name={props.name} placeholder={props.placeholder} required={props.required} rows={5} /></div> }
