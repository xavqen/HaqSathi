import type { Metadata } from 'next'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const dynamic = 'force-static'
export const revalidate = 86400

export const metadata: Metadata = { title: 'Terms', description: 'Use HaqSathi AI responsibly.' }

export default function Page() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-12">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Terms</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-700">Output is AI-generated guidance and must be verified.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/complaint" className="rounded-xl bg-primary px-5 py-3 font-semibold text-primary-foreground">Generate Complaint</Link>
            <Link href="/" className="rounded-xl border px-5 py-3 font-semibold">Home</Link>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
