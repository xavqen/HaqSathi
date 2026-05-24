import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const metadata = { title: 'Final Launch Checklist | HaqSathi AI', description: 'Last step launch checklist for HaqSathi AI.' }

const items = [
  'Supabase DB connection OK and db:push completed',
  'Storage bucket documents created and service role key added',
  'Resend domain verified and forgot password tested',
  'Razorpay test payment and webhook verified',
  'Admin, demo, and normal user flows tested',
  'Mobile Chrome testing completed',
  'Sitemap and robots open correctly',
  'Production env variables added in Vercel',
  'npm run build passes without error'
]

export default function Page() {
  return (
    <main className="bg-slate-50">
      <section className="mx-auto max-w-5xl px-4 py-12">
        <p className="text-sm font-bold uppercase tracking-wider text-primary">Final Phase</p>
        <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-950">Final launch checklist</h1>
        <p className="mt-3 text-slate-600">Ye checklist pass hone ke baad project ko public users ke liye launch kar sakte ho.</p>
        <div className="mt-8 grid gap-4">
          {items.map((item, index) => <Card key={item}><CardHeader><CardTitle>{index + 1}. {item}</CardTitle></CardHeader><CardContent><p className="text-sm text-slate-600">Pass hone par admin Final QA page me mark/track karo.</p></CardContent></Card>)}
        </div>
        <div className="mt-8 flex flex-wrap gap-3"><Link href="/launch-readiness" className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground">Launch readiness</Link><Link href="/deploy-guide" className="rounded-xl border px-5 py-3 text-sm font-semibold">Deploy guide</Link></div>
      </section>
    </main>
  )
}
