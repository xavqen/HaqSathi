import type { Metadata } from 'next'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const metadata: Metadata = { title: 'Bank Complaint', description: 'Bank debit, charge, refund aur UPI issue complaint helper.' }

export default function Page() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-12">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Bank Complaint</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-700">Sensitive account details public jagah share mat karo.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/complaint" className="rounded-xl bg-primary px-5 py-3 font-semibold text-primary-foreground">Generate Complaint</Link>
            <Link href="/" className="rounded-xl border px-5 py-3 font-semibold">Home</Link>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
