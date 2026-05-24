'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select } from '@/components/ui/select'

type ComplaintOption = { id: string; type: string; companyName: string }

export function CasePackageForm({ complaints }: { complaints: ComplaintOption[] }) {
  const [complaintId, setComplaintId] = useState(complaints[0]?.id || '')
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  async function submit() {
    if (!complaintId) return setMessage('Pehle ek complaint select karo.')
    setLoading(true); setMessage(null)
    const res = await fetch('/api/case-packages', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ complaintId }) })
    const data = await res.json().catch(() => ({ ok: false, error: 'Invalid response' }))
    setLoading(false)
    setMessage(data.ok ? 'Case package saved. Page refresh karo ya list check karo.' : (data.error || 'Package create nahi hua.'))
  }
  return <Card><CardHeader><CardTitle>Build case package</CardTitle></CardHeader><CardContent className="space-y-4">{complaints.length === 0 ? <p className="text-sm text-slate-600">Pehle complaint generate/save karo.</p> : <><Select value={complaintId} onChange={(e)=>setComplaintId(e.target.value)}>{complaints.map((c)=><option key={c.id} value={c.id}>{c.type} · {c.companyName}</option>)}</Select><Button type="button" onClick={submit} disabled={loading}>{loading ? 'Creating...' : 'Create evidence + draft package'}</Button></>}{message && <p className="rounded-xl bg-slate-50 p-3 text-sm text-slate-700">{message}</p>}</CardContent></Card>
}
