import Link from 'next/link'
import { getSecurityHardeningChecks } from '@/lib/launch/security-hardening'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const metadata = { title: 'Launch Readiness | HaqSathi AI', description: 'Production launch checklist for HaqSathi AI.' }

export default function Page() {
  const security = getSecurityHardeningChecks()
  return (
    <main className="bg-slate-50">
      <section className="mx-auto max-w-7xl px-4 py-12">
        <p className="text-sm font-bold uppercase tracking-wider text-primary">Phase 17</p>
        <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-950">Final launch readiness</h1>
        <p className="mt-3 max-w-2xl text-slate-600">After feature build, pass these final checks before production launch.</p>
        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {['Build pass', 'DB + Storage ready', 'Payments tested', 'Email tested'].map((item) => <Card key={item}><CardHeader><CardTitle>{item}</CardTitle></CardHeader><CardContent><p className="text-sm text-slate-600">Verify the matching audit page in the admin panel.</p></CardContent></Card>)}
        </div>
        <div className="mt-8 rounded-3xl border bg-white p-6 shadow-soft">
          <h2 className="text-2xl font-black">Security baseline</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {security.map((item) => <div key={`${item.area}-${item.item}`} className="rounded-2xl bg-slate-50 p-4"><p className="font-bold">{item.item}</p><p className="mt-1 text-sm text-slate-600">{item.note}</p></div>)}
          </div>
          <div className="mt-6 flex flex-wrap gap-3"><Link href="/admin/launch" className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground">Open admin launch checks</Link><Link href="/deploy-guide" className="rounded-xl border px-5 py-3 text-sm font-semibold">Deployment guide</Link></div>
        </div>
      </section>
    </main>
  )
}
