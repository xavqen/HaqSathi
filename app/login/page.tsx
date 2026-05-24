import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LoginForm } from '@/components/forms/auth-form'

export const metadata: Metadata = { title: 'Login', description: 'Login to HaqSathi AI dashboard.' }

export default function Page() {
  return (
    <main className="mx-auto max-w-md px-4 py-12">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Login</CardTitle>
          <CardDescription>Google ya email se dashboard, saved drafts aur reminders access karo.</CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div>Loading...</div>}><LoginForm /></Suspense>
          <p className="mt-5 text-center text-sm text-slate-600">Account nahi hai? <Link className="font-semibold text-emerald-700" href="/register">Register</Link></p>
        </CardContent>
      </Card>
    </main>
  )
}
