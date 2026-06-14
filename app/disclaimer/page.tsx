import type { Metadata } from 'next'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const dynamic = 'force-static'
export const revalidate = 86400

export const metadata: Metadata = { title: 'Disclaimer', description: 'This is guidance, not legal advice.' }

export default function Page() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-12">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Disclaimer</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-700">We are not a government authority, bank, police, lawyer or official portal.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/complaint" className="rounded-xl bg-primary px-5 py-3 font-semibold text-primary-foreground">Generate Complaint</Link>
            <Link href="/" className="rounded-xl border px-5 py-3 font-semibold">Home</Link>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
