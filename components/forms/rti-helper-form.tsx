'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { AdvancedToolResult } from '@/components/forms/advanced-tool-result'


export function RtiHelperForm() {
  const [result, setResult] = useState<Record<string, any> | null>(null)
  const [error, setError] = useState<string | null>(null)
  async function submit(formData: FormData) {
    setError(null)
    const res = await fetch('/api/tools/rti-helper', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(Object.fromEntries(formData.entries())) })
    const data = await res.json().catch(() => ({ ok: false, error: 'Request failed' }))
    if (!data.ok) return setError(data.error || 'Failed')
    setResult(data.result)
  }
  return <div className="rounded-3xl border bg-white p-6 shadow-soft"><h2 className="text-2xl font-black">RTI application helper</h2><form action={submit} className="mt-5 grid gap-4 md:grid-cols-2"><Field name="department" label="Department/Office" required /><Field name="state" label="State optional" /><Field name="applicantName" label="Applicant name" required /><Field name="applicantAddress" label="Address optional" /><Field name="topic" label="Topic" required /><Field name="period" label="Period optional" placeholder="Jan 2025 to Mar 2025" /><Area name="questions" label="Questions" placeholder="Write one RTI question per line." required /><div><Label>Language</Label><Select name="language" defaultValue="ENGLISH"><option value="ENGLISH">English</option><option value="HINGLISH">Hinglish</option><option value="HINDI">Hindi</option><option value="BENGALI">Bengali</option><option value="MARATHI">Marathi</option><option value="TAMIL">Tamil</option><option value="TELUGU">Telugu</option><option value="KANNADA">Kannada</option><option value="MALAYALAM">Malayalam</option><option value="URDU">Urdu</option><option value="SPANISH">Spanish</option><option value="FRENCH">French</option><option value="ARABIC">Arabic</option></Select></div><div className="flex items-end"><Button>Generate RTI Draft</Button></div></form>{error && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}{result && <AdvancedToolResult result={result} />}</div>
}
function Field(props: { name: string; label: string; placeholder?: string; required?: boolean }) { return <div><Label>{props.label}</Label><Input name={props.name} placeholder={props.placeholder} required={props.required} /></div> }
function Area(props: { name: string; label: string; placeholder?: string; required?: boolean }) { return <div className="md:col-span-2"><Label>{props.label}</Label><Textarea name={props.name} placeholder={props.placeholder} required={props.required} rows={6} /></div> }
