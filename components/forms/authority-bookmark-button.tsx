'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

export function AuthorityBookmarkButton({ authorityId }: { authorityId: string }) {
  const [message, setMessage] = useState('')
  async function save() {
    setMessage('Saving...')
    const res = await fetch('/api/authority-bookmarks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ authorityId }) })
    setMessage(res.ok ? 'Saved' : 'Login required')
  }
  return <div className="flex items-center gap-2"><Button type="button" variant="outline" size="sm" onClick={save}>Save</Button>{message && <span className="text-xs text-slate-500">{message}</span>}</div>
}
