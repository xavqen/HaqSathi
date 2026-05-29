'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { AdvancedToolResult } from '@/components/forms/advanced-tool-result'

export function OmbudsmanPlannerForm() {
  const [result, setResult] = useState<Record<string, any> | null>(null)
  const [error, setError] = useState<string | null>(null)
  async function submit(formData: FormData) {
    setError(null)
    const res = await fetch('/api/tools/ombudsman-planner', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(Object.fromEntries(formData.entries())) })
    const data = await res.json().catch(() => ({ ok: false, error: 'Request failed' }))
    if (!data.ok) return setError(data.error || 'Failed')
    setResult(data.result)
  }
  return <div className="rounded-3xl border bg-white p-6 shadow-soft"><h2 className="text-2xl font-black">Ombudsman escalation planner</h2><p className="mt-2 text-sm text-slate-600">Bank, wallet, insurer, telecom ya service grievance ko official escalation ke liye organize karo.</p><form action={submit} className="mt-5 grid gap-4 md:grid-cols-2"><Field name="institutionName" label="Company/Bank/Institution" required /><Field name="issueType" label="Issue type" placeholder="Refund delay, bank debit, service failure..." required /><Field name="complaintId" label="Existing complaint ID optional" /><Field name="complaintDate" label="Complaint date optional" type="date" /><Field name="amount" label="Amount optional" /><Area name="currentStatus" label="Current status" placeholder="Kya hua, kab complaint ki, kya reply mila?" required /><Area name="reliefRequested" label="Relief requested" placeholder="Refund, reversal, correction, written apology..." required /><Area name="documentsAvailable" label="Documents/evidence available" placeholder="Receipt, screenshots, emails, statement..." /><div><Label>Language</Label><Select name="language" defaultValue="ENGLISH"><option value="ENGLISH">English</option><option value="HINGLISH">Hinglish</option><option value="HINDI">Hindi</option><option value="BENGALI">Bengali</option><option value="MARATHI">Marathi</option><option value="TAMIL">Tamil</option><option value="TELUGU">Telugu</option><option value="KANNADA">Kannada</option><option value="MALAYALAM">Malayalam</option><option value="URDU">Urdu</option><option value="SPANISH">Spanish</option><option value="FRENCH">French</option><option value="ARABIC">Arabic</option></Select></div><div className="flex items-end"><Button>Build Plan</Button></div></form>{error && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}{result && <AdvancedToolResult result={result} />}</div>
}
function Field(props: { name: string; label: string; placeholder?: string; required?: boolean; type?: string }) { return <div><Label>{props.label}</Label><Input name={props.name} type={props.type || 'text'} placeholder={props.placeholder} required={props.required} /></div> }
function Area(props: { name: string; label: string; placeholder?: string; required?: boolean }) { return <div className="md:col-span-2"><Label>{props.label}</Label><Textarea name={props.name} placeholder={props.placeholder} required={props.required} rows={5} /></div> }
