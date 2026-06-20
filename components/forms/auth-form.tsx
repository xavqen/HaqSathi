'use client'

import { useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, registerSchema, type LoginInput, type RegisterInput } from '@/lib/validators/auth'
import { safeRedirectPath } from '@/lib/security/redirect'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

async function readApiJson(res: Response) {
  const text = await res.text()
  try {
    return text ? JSON.parse(text) : { ok: false, error: 'Server ne empty response diya.' }
  } catch {
    return { ok: false, error: `Server response JSON nahi tha. Status: ${res.status}` }
  }
}

function authErrorMessage(error: string | null) {
  if (!error) return null
  const map: Record<string, string> = {
    google_not_configured: 'Google login abhi configure nahi hai. .env me GOOGLE_CLIENT_ID aur GOOGLE_CLIENT_SECRET add karo.',
    google_code_missing: 'Google ne login code return nahi kiya. Dobara try karo.',
    google_state_invalid: 'Google login security check fail hua. Dobara try karo.',
    google_login_failed: 'Google login fail hua. OAuth redirect URI aur client secret check karo.'
  }
  return map[error] || 'Login failed. Dobara try karo.'
}

export function GoogleAuthButton({ label = 'Continue with Google' }: { label?: string }) {
  const params = useSearchParams()
  const next = safeRedirectPath(params.get('next'))
  const href = useMemo(() => `/api/auth/google?next=${encodeURIComponent(next)}`, [next])
  return (
    <a href={href} className="inline-flex h-11 w-full items-center justify-center gap-3 rounded-xl border bg-white px-5 text-sm font-bold text-slate-800 shadow-sm hover:bg-slate-50">
      <span className="flex h-5 w-5 items-center justify-center rounded-full border text-xs font-black text-blue-700">G</span>
      {label}
    </a>
  )
}

function Divider() {
  return <div className="flex items-center gap-3 py-2"><span className="h-px flex-1 bg-slate-200" /><span className="text-xs font-semibold uppercase tracking-wide text-slate-400">or</span><span className="h-px flex-1 bg-slate-200" /></div>
}

export function LoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const next = safeRedirectPath(params.get('next'))
  const oauthError = authErrorMessage(params.get('error'))
  const [error, setError] = useState<string | null>(oauthError)
  const [loading, setLoading] = useState(false)
  const form = useForm<LoginInput>({ resolver: zodResolver(loginSchema), defaultValues: { email: '', password: '' } })

  async function onSubmit(values: LoginInput) {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(values) })
      const data = await readApiJson(res)
      if (!data.ok) return setError(data.error || 'Login failed')
      router.push(next)
      router.refresh()
    } catch {
      setError('Network/server issue. npm run db:doctor check karo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <GoogleAuthButton />
      <Divider />
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid gap-2"><Label>Email</Label><Input type="email" autoComplete="email" {...form.register('email')} />{form.formState.errors.email && <p className="text-sm text-red-600">{form.formState.errors.email.message}</p>}</div>
        <div className="grid gap-2"><Label>Password</Label><Input type="password" autoComplete="current-password" {...form.register('password')} />{form.formState.errors.password && <p className="text-sm text-red-600">{form.formState.errors.password.message}</p>}</div>
        {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        <Button className="w-full" disabled={loading}>{loading ? 'Logging in...' : 'Login'}</Button>
      </form>
    </div>
  )
}

export function RegisterForm() {
  const router = useRouter()
  const params = useSearchParams()
  const oauthError = authErrorMessage(params.get('error'))
  const [error, setError] = useState<string | null>(oauthError)
  const [loading, setLoading] = useState(false)
  const form = useForm<RegisterInput>({ resolver: zodResolver(registerSchema), defaultValues: { name: '', email: '', password: '' } })

  async function onSubmit(values: RegisterInput) {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(values) })
      const data = await readApiJson(res)
      if (!data.ok) return setError(data.error || 'Registration failed')
      router.push('/dashboard')
      router.refresh()
    } catch {
      setError('Network/server issue. npm run db:doctor check karo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <GoogleAuthButton label="Sign up with Google" />
      <Divider />
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid gap-2"><Label>Name</Label><Input autoComplete="name" {...form.register('name')} />{form.formState.errors.name && <p className="text-sm text-red-600">{form.formState.errors.name.message}</p>}</div>
        <div className="grid gap-2"><Label>Email</Label><Input type="email" autoComplete="email" {...form.register('email')} />{form.formState.errors.email && <p className="text-sm text-red-600">{form.formState.errors.email.message}</p>}</div>
        <div className="grid gap-2"><Label>Password</Label><Input type="password" autoComplete="new-password" placeholder="Minimum 8 characters" {...form.register('password')} />{form.formState.errors.password && <p className="text-sm text-red-600">{form.formState.errors.password.message}</p>}</div>
        {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        <Button className="w-full" disabled={loading}>{loading ? 'Creating...' : 'Create account'}</Button>
      </form>
    </div>
  )
}

export function LogoutButton({ label = 'Logout', className = 'rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-bold text-red-700 hover:bg-red-100' }: { label?: string; className?: string }) {
  const router = useRouter()
  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/')
    router.refresh()
  }
  return <button type="button" onClick={logout} className={className}>{label}</button>
}
