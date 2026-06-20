import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EmailVerificationResendForm } from '@/components/forms/email-verification-form'

export const metadata = { title: 'Verify Email' }

export default async function VerifyEmailPage({ searchParams }: { searchParams?: Promise<{ status?: string }> | { status?: string } }) {
  const params = await Promise.resolve(searchParams || {})
  const status = params.status
  const message = status === 'verified'
    ? 'Email verified successfully. Your account is ready for production notifications.'
    : status === 'invalid'
      ? 'Verification link is invalid or expired. Request a new link.'
      : 'Check your inbox and verify your email address.'

  return <main className="bg-slate-50"><section className="mx-auto max-w-xl px-4 py-12"><Card><CardHeader><CardTitle>Email verification</CardTitle></CardHeader><CardContent className="space-y-5"><p className="text-sm leading-6 text-slate-600">{message}</p><EmailVerificationResendForm /><div className="flex flex-wrap gap-3 text-sm font-bold"><Link className="text-primary underline" href="/dashboard">Go to dashboard</Link><Link className="text-slate-600 underline" href="/login">Login</Link></div></CardContent></Card></section></main>
}
