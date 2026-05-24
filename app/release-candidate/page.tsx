import type { Metadata } from 'next'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const metadata: Metadata = { title: 'Release Candidate | HaqSathi AI', description: 'Final release candidate status for HaqSathi AI launch.' }

const items = [
  'Core complaint, UPI, scheme, document and chat flows ready',
  'Dashboard, admin, SEO, PWA, storage and payment-ready layers included',
  'Build/runtime guard scripts included for local and Vercel checks',
  'Feature freeze active: only bug fixes and verified data updates now'
]

export default function Page() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-12">
      <p className="text-sm font-semibold text-primary">v2.0.0 RC1</p>
      <h1 className="mt-2 text-4xl font-black">HaqSathi AI Release Candidate</h1>
      <p className="mt-3 max-w-2xl text-slate-600">Project feature-freeze mode me hai. Ab final kaam sirf build errors, production env, payment/email/storage verification aur official-data QA hai.</p>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {items.map((item) => (
          <Card key={item}><CardHeader><CardTitle>Ready check</CardTitle></CardHeader><CardContent>{item}</CardContent></Card>
        ))}
      </div>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link className="rounded-2xl bg-primary px-5 py-3 font-bold text-white" href="/launch-readiness">Launch readiness</Link>
        <Link className="rounded-2xl border px-5 py-3 font-bold" href="/deploy-guide">Deploy guide</Link>
      </div>
    </main>
  )
}
