'use client'

import { useRouter } from 'next/navigation'
import { type FormEvent, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function ProfileForm({ name }: { name: string }) {
  const router = useRouter()
  const [value, setValue] = useState(name)
  const [message, setMessage] = useState('')

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setMessage('Saving...')
    const res = await fetch('/api/profile', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: value }) })
    setMessage(res.ok ? 'Saved.' : 'Save failed.')
    router.refresh()
  }

  return <form onSubmit={submit} className="space-y-3"><div className="grid gap-2"><Label>Name</Label><Input value={value} onChange={(e) => setValue(e.target.value)} /></div><Button type="submit">Save Profile</Button>{message && <p className="text-sm text-slate-500">{message}</p>}</form>
}

export function GoogleAccountCard({ connected }: { connected: boolean }) {
  return (
    <Card>
      <CardHeader><CardTitle>Google account</CardTitle></CardHeader>
      <CardContent className="space-y-3 text-sm text-slate-600">
        <p>{connected ? 'Google login is connected. You can sign in with Google or email/password.' : 'Connect Google to enable one-click sign-in.'}</p>
        <a href="/api/auth/google?next=/dashboard/profile" className="inline-flex h-11 items-center justify-center gap-3 rounded-xl border bg-white px-5 text-sm font-bold text-slate-800 shadow-sm hover:bg-slate-50">
          <span className="flex h-5 w-5 items-center justify-center rounded-full border text-xs font-black text-blue-700">G</span>
          {connected ? 'Reconnect Google' : 'Connect Google'}
        </a>
      </CardContent>
    </Card>
  )
}
