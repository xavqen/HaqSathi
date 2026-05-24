'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Download, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'

const statuses = ['DRAFT', 'SENT', 'FOLLOW_UP', 'RESOLVED', 'CLOSED'] as const

export function ComplaintActions({ id, status, shareText }: { id: string; status: string; shareText: string }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)

  async function updateStatus(nextStatus: string) {
    setBusy(true)
    await fetch(`/api/complaints/${id}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: nextStatus }) })
    setBusy(false)
    router.refresh()
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select defaultValue={status} onChange={(e) => updateStatus(e.target.value)} disabled={busy} className="h-9 w-40">
        {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
      </Select>
      <a className="inline-flex h-9 items-center justify-center rounded-xl border px-3 text-sm font-semibold hover:bg-slate-50" href={`/api/complaints/${id}/export`}>
        <Download className="mr-2 h-4 w-4" />PDF
      </a>
      <a className="inline-flex h-9 items-center justify-center rounded-xl border px-3 text-sm font-semibold hover:bg-slate-50" target="_blank" href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}>
        <MessageCircle className="mr-2 h-4 w-4" />WhatsApp
      </a>
      <Button type="button" variant="outline" onClick={() => navigator.clipboard.writeText(shareText)}>Copy</Button>
    </div>
  )
}
