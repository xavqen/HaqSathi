'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Label } from '@/components/ui/label'

export function DocumentVaultForm() {
  const router = useRouter()
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setMessage('Uploading securely...')
    const form = e.currentTarget
    const payload = new FormData(form)
    const res = await fetch('/api/document-vault/upload', { method: 'POST', body: payload })
    const data = await res.json().catch(() => ({ ok: false, error: 'Upload failed' }))
    setLoading(false)
    setMessage(data.ok ? 'Document uploaded and saved.' : data.error || 'Upload failed.')
    if (data.ok) form.reset()
    router.refresh()
  }

  return (
    <form onSubmit={submit} className="grid gap-3">
      <div className="grid gap-2"><Label>Document title</Label><Input name="title" placeholder="Aadhaar front, Income certificate..." required /></div>
      <div className="grid gap-2"><Label>Type</Label><Select name="docType" defaultValue="Aadhaar"><option>Aadhaar</option><option>PAN</option><option>Income Certificate</option><option>Caste Certificate</option><option>Domicile</option><option>Bank Passbook</option><option>Marksheet</option><option>Other</option></Select></div>
      <div className="grid gap-2"><Label>Upload file</Label><Input name="file" type="file" accept="application/pdf,image/jpeg,image/png,image/webp" required /><p className="text-xs text-slate-500">PDF/JPG/PNG/WEBP, max 5MB. Stored in Supabase private bucket.</p></div>
      <div className="grid gap-2"><Label>Expiry / renewal date</Label><Input name="expiryDate" type="date" /></div>
      <div className="grid gap-2"><Label>Notes</Label><Textarea name="notes" placeholder="Example: Needed for scholarship, bank KYC, admission..." /></div>
      <Button type="submit" disabled={loading}>{loading ? 'Uploading...' : 'Upload Secure Document'}</Button>
      {message && <p className="text-sm text-slate-500">{message}</p>}
    </form>
  )
}

export function DocumentDownloadButton({ itemId }: { itemId: string }) {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  async function openFile() {
    setLoading(true)
    setMessage('')
    const res = await fetch(`/api/document-vault/download?itemId=${encodeURIComponent(itemId)}`)
    const data = await res.json().catch(() => ({ ok: false, error: 'Link failed' }))
    setLoading(false)
    if (!data.ok) return setMessage(data.error || 'Link failed')
    window.open(data.url, '_blank', 'noopener,noreferrer')
  }

  return <div className="mt-3 flex flex-wrap items-center gap-2"><Button type="button" size="sm" variant="outline" onClick={openFile} disabled={loading}>{loading ? 'Opening...' : 'Open secure file'}</Button>{message && <span className="text-xs text-red-600">{message}</span>}</div>
}
