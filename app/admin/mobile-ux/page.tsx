import Link from 'next/link'
import { MobileReadinessCheckerForm } from '@/components/forms/mobile-readiness-checker-form'

export const dynamic = 'force-dynamic'

export default function Page() {
  const checklist = ['Header sticky + visible on mobile', 'Horizontal nav scroll enabled', 'No hidden core CTA after login', 'Profile language selector visible', 'Inputs min text-base', 'Bottom quick actions do not block submit buttons', 'All cards rounded and tap-friendly']
  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-white p-6 shadow-soft">
        <p className="text-sm font-bold uppercase tracking-wider text-primary">Admin mobile UX</p>
        <h1 className="mt-2 text-3xl font-black">Mobile responsive QA desk</h1>
        <p className="mt-2 text-slate-600">Launch se pehle har important page ko mobile-first test karo.</p>
        <Link href="/tools/mobile-readiness" className="mt-4 inline-flex rounded-2xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground">Open public checker</Link>
      </div>
      <div className="grid gap-4 md:grid-cols-2">{checklist.map((item) => <div key={item} className="rounded-3xl border bg-white p-5 font-bold shadow-soft">✅ {item}</div>)}</div>
      <MobileReadinessCheckerForm />
    </div>
  )
}
