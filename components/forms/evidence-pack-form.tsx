'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { AdvancedToolResult } from '@/components/forms/advanced-tool-result'

export function EvidencePackForm() {
  const [result, setResult] = useState<Record<string, any> | null>(null)
  const [error, setError] = useState<string | null>(null)
  async function submit(formData: FormData) {
    setError(null)
    const res = await fetch('/api/evidence-packs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(Object.fromEntries(formData.entries())) })
    const data = await res.json().catch(() => ({ ok: false, error: 'Request failed' }))
    if (!data.ok) return setError(data.error || 'Failed')
    setResult(data.result)
  }
  return <div className="rounded-3xl border bg-white p-6 shadow-soft"><h2 className="text-2xl font-black">Evidence pack builder</h2><form action={submit} className="mt-5 grid gap-4 md:grid-cols-2"><Field name="caseTitle" label="Case title" required /><Field name="category" label="Category" required /><Field name="complaintId" label="Complaint ID optional" /><Field name="referenceId" label="Reference/transaction ID" /><Field name="amount" label="Amount" /><div /><Area name="timeline" label="Timeline" placeholder="Date-wise events" /><Area name="evidenceList" label="Evidence list" placeholder="One proof per line" /><Area name="notes" label="Notes" /><div className="md:col-span-2"><Button>Create Evidence Pack</Button></div></form>{error && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}{result && <AdvancedToolResult result={result} />}</div>
}
function Field(props: { name: string; label: string; required?: boolean }) { return <div><Label>{props.label}</Label><Input name={props.name} required={props.required} /></div> }
function Area(props: { name: string; label: string; placeholder?: string }) { return <div className="md:col-span-2"><Label>{props.label}</Label><Textarea name={props.name} placeholder={props.placeholder} rows={4} /></div> }
