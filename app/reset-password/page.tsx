import type { Metadata } from 'next'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ResetPasswordForm } from '@/components/forms/reset-password-form'

export const metadata: Metadata = { title: 'Reset Password', description: 'Create a new HaqSathi AI password.' }

export default function Page({ searchParams }: { searchParams: { token?: string } }) {
  const token = searchParams.token || ''
  return (
    <main className="mx-auto max-w-md px-4 py-12">
      <Card>
        <CardHeader><CardTitle className="text-3xl">Reset password</CardTitle><CardDescription>New secure password set karo.</CardDescription></CardHeader>
        <CardContent>{token ? <ResetPasswordForm token={token} /> : <p className="text-sm text-red-600">Reset token missing. <Link className="font-semibold underline" href="/forgot-password">Request new link</Link></p>}</CardContent>
      </Card>
    </main>
  )
}
