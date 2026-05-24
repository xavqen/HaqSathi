import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { RegisterForm } from '@/components/forms/auth-form'

export const metadata: Metadata = { title: 'Register', description: 'Create your HaqSathi AI account.' }

export default function Page() {
  return (
    <main className="mx-auto max-w-md px-4 py-12">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Create account</CardTitle>
          <CardDescription>Google ya email se free account banao, phir complaints, checklists aur searches save honge.</CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div>Loading...</div>}><RegisterForm /></Suspense>
          <p className="mt-5 text-center text-sm text-slate-600">Already account hai? <Link className="font-semibold text-emerald-700" href="/login">Login</Link></p>
        </CardContent>
      </Card>
    </main>
  )
}
