import type { Metadata } from 'next'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ForgotPasswordForm } from '@/components/forms/forgot-password-form'

export const metadata: Metadata = { title: 'Forgot Password', description: 'Request a HaqSathi AI password reset.' }

export default function Page() {
  const cardDescription = process.env.NODE_ENV !== 'production'
    ? 'Enter your email. If Resend is configured, a reset email will be sent; in local development, an explicitly enabled dev reset link can appear on screen.'
    : 'Enter your email. If your account exists, we will send secure reset instructions.'
  return (
    <main className="mx-auto max-w-md px-4 py-12">
      <Card>
        <CardHeader><CardTitle className="text-3xl">Forgot password</CardTitle><CardDescription>{cardDescription}</CardDescription></CardHeader>
        <CardContent><ForgotPasswordForm /><p className="mt-5 text-center text-sm text-slate-600"><Link className="font-semibold text-emerald-700" href="/login">Back to login</Link></p></CardContent>
      </Card>
    </main>
  )
}
