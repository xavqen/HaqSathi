import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LoginForm } from '@/components/forms/auth-form'
import { getCurrentPageCopy } from '@/lib/i18n/page-copy'
import { getCurrentUser } from '@/lib/auth/session'
import { safeRedirectPath } from '@/lib/security/redirect'

export const metadata: Metadata = { title: 'Login', description: 'Login to HaqSathi AI dashboard.' }
export const dynamic = 'force-dynamic'

type LoginPageProps = { searchParams?: Promise<Record<string, string | string[] | undefined>> }

export default async function Page({ searchParams }: LoginPageProps) {
  const params = (await searchParams) || {}
  const nextParam = Array.isArray(params.next) ? params.next[0] : params.next
  const next = safeRedirectPath(nextParam)
  const user = await getCurrentUser()
  if (user) redirect(next)
  const copy = (await getCurrentPageCopy()).login
  return (
    <main className="grid min-h-[calc(100vh-12rem)] place-items-center bg-slate-50 px-4 py-10">
      <Card className="w-full max-w-md rounded-[1.75rem]">
        <CardHeader>
          <p className="text-sm font-black uppercase tracking-wider text-emerald-700">{copy.kicker}</p>
          <CardTitle className="text-3xl">{copy.title}</CardTitle>
          <CardDescription>{copy.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div>Loading...</div>}><LoginForm /></Suspense>
          <p className="mt-5 text-center text-sm text-slate-600">No account yet? <Link className="font-semibold text-emerald-700" href="/register">Register</Link></p>
        </CardContent>
      </Card>
    </main>
  )
}
