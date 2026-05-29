'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function IssueTrendForm() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  async function submit(formData: FormData) {
    setLoading(true)
    const body = Object.fromEntries(formData.entries())
    const res = await fetch('/api/issue-trends', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    const data = await res.json()
    setResult(data.result || null)
    setLoading(false)
  }
  return <Card><CardHeader><CardTitle>Report public-safe issue trend</CardTitle></CardHeader><CardContent><form action={submit} className="space-y-4">
    <div className="grid gap-4 sm:grid-cols-2"><div><Label>Issue type</Label><select name="issueType" className="mt-2 w-full rounded-xl border px-3 py-2"><option>REFUND</option><option>UPI</option><option>BANK</option><option>CYBER_FRAUD</option><option>ECOMMERCE</option><option>DOCUMENT</option><option>SCHEME</option><option>EDUCATION</option><option>TRAVEL</option><option>OTHER</option></select></div><div><Label>Severity</Label><select name="severity" className="mt-2 w-full rounded-xl border px-3 py-2"><option>MEDIUM</option><option>LOW</option><option>HIGH</option><option>URGENT</option></select></div></div>
    <div className="grid gap-4 sm:grid-cols-3"><div><Label>Company</Label><Input name="companyName" /></div><div><Label>State</Label><Input name="state" /></div><div><Label>City</Label><Input name="city" /></div></div>
    <div><Label>Public-safe summary</Label><Textarea name="summary" required rows={4} placeholder="No OTP, phone number, address, UTR or ID proof." /></div>
    <Button disabled={loading}>{loading ? 'Saving...' : 'Save trend signal'}</Button>
  </form>{result ? <div className="mt-5 rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-900"><b>{result.title}</b><p>{result.value}</p><p className="mt-2 text-xs">{result.privacyNote}</p></div> : null}</CardContent></Card>
}
