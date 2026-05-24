import type { Metadata } from 'next'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const metadata: Metadata = { title: 'About', description: 'HaqSathi AI common people ko simple language me life-admin help deta hai.' }

export default function Page() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-12">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">About</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-700">India-first guidance assistant for complaints, refunds, schemes and documents.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/complaint" className="rounded-xl bg-primary px-5 py-3 font-semibold text-primary-foreground">Generate Complaint</Link>
            <Link href="/" className="rounded-xl border px-5 py-3 font-semibold">Home</Link>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
