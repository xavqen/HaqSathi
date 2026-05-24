'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { AdvancedToolResult } from '@/components/forms/advanced-tool-result'


export function ConsumerForumPackForm() {
  const [result, setResult] = useState<Record<string, any> | null>(null)
  const [error, setError] = useState<string | null>(null)
  async function submit(formData: FormData) {
    setError(null)
    const res = await fetch('/api/tools/consumer-forum-pack', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(Object.fromEntries(formData.entries())) })
    const data = await res.json().catch(() => ({ ok: false, error: 'Request failed' }))
    if (!data.ok) return setError(data.error || 'Failed')
    setResult(data.result)
  }
  return <div className="rounded-3xl border bg-white p-6 shadow-soft"><h2 className="text-2xl font-black">Consumer forum pack builder</h2><form action={submit} className="mt-5 grid gap-4 md:grid-cols-2"><Field name="complainantName" label="Complainant name" required /><Field name="oppositeParty" label="Company/opposite party" required /><Field name="productOrService" label="Product/service" required /><Field name="amount" label="Amount" /><Field name="purchaseDate" label="Purchase date" type="date" /><Field name="reliefRequested" label="Relief requested" required /><Area name="issueSummary" label="Issue summary" required /><Area name="evidenceAvailable" label="Evidence available optional" /><div><Label>Language</Label><Select name="language" defaultValue="HINGLISH"><option value="HINGLISH">Hinglish</option><option value="HINDI">Hindi</option><option value="ENGLISH">English</option></Select></div><div className="flex items-end"><Button>Build Pack</Button></div></form>{error && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}{result && <AdvancedToolResult result={result} />}</div>
}
function Field(props: { name: string; label: string; placeholder?: string; type?: string; required?: boolean }) { return <div><Label>{props.label}</Label><Input name={props.name} type={props.type || 'text'} placeholder={props.placeholder} required={props.required} /></div> }
function Area(props: { name: string; label: string; required?: boolean }) { return <div className="md:col-span-2"><Label>{props.label}</Label><Textarea name={props.name} required={props.required} rows={5} /></div> }
