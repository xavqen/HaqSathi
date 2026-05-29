import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { RegisterForm } from '@/components/forms/auth-form'
import { getCurrentPageCopy } from '@/lib/i18n/page-copy'

export const metadata: Metadata = { title: 'Register', description: 'Create your HaqSathi AI account.' }
export const dynamic = 'force-dynamic'

export default async function Page() {
  const copy = (await getCurrentPageCopy()).register
  return (
    <main className="grid min-h-[calc(100vh-12rem)] place-items-center bg-slate-50 px-4 py-10">
      <Card className="w-full max-w-md rounded-[1.75rem]">
        <CardHeader>
          <p className="text-sm font-black uppercase tracking-wider text-emerald-700">{copy.kicker}</p>
          <CardTitle className="text-3xl">{copy.title}</CardTitle>
          <CardDescription>{copy.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div>Loading...</div>}><RegisterForm /></Suspense>
          <p className="mt-5 text-center text-sm text-slate-600">Already have an account? <Link className="font-semibold text-emerald-700" href="/login">Login</Link></p>
        </CardContent>
      </Card>
    </main>
  )
}
