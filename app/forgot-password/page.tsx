import type { Metadata } from 'next'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ForgotPasswordForm } from '@/components/forms/forgot-password-form'

export const metadata: Metadata = { title: 'Forgot Password', description: 'Request a HaqSathi AI password reset.' }

export default function Page() {
  return (
    <main className="mx-auto max-w-md px-4 py-12">
      <Card>
        <CardHeader><CardTitle className="text-3xl">Forgot password</CardTitle><CardDescription>Email enter karo. Resend configured hoga to reset email jayega; local dev me reset link screen par dikhega.</CardDescription></CardHeader>
        <CardContent><ForgotPasswordForm /><p className="mt-5 text-center text-sm text-slate-600"><Link className="font-semibold text-emerald-700" href="/login">Back to login</Link></p></CardContent>
      </Card>
    </main>
  )
}
