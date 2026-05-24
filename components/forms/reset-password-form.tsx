'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMsg(null)
    const res = await fetch('/api/auth/reset-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, password }) })
    const data = await res.json().catch(() => ({ ok: false, error: 'Reset failed' }))
    setLoading(false)
    if (!data.ok) return setMsg(data.error || 'Reset failed')
    router.push('/dashboard')
  }

  return <form onSubmit={submit} className="space-y-4"><div className="grid gap-2"><Label>New password</Label><Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={8} required /></div><Button className="w-full" disabled={loading}>{loading ? 'Updating...' : 'Reset password'}</Button>{msg && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{msg}</p>}</form>
}
