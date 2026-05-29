import type { Metadata } from 'next'
import Link from 'next/link'
import { ComplaintGenerator } from '@/components/forms/complaint-generator'
import { getCurrentPageCopy } from '@/lib/i18n/page-copy'

export const metadata: Metadata = { title: 'Refund Complaint Generator', description: 'Refund not received complaint email, support message and follow-up draft generator.' }
export const dynamic = 'force-dynamic'

export default async function Page() {
  const copy = (await getCurrentPageCopy()).refund
  return (
    <main className="bg-slate-50">
      <section className="hs-container py-8 sm:py-12">
        <div className="mb-6 max-w-3xl sm:mb-8">
          <p className="text-sm font-black uppercase tracking-wider text-emerald-700">{copy.kicker}</p>
          <h1 className="mt-2 text-[2.25rem] font-black leading-none tracking-tight text-slate-950 sm:text-5xl">{copy.title}</h1>
          <p className="mt-4 text-base leading-7 text-slate-600 sm:text-lg">{copy.description}</p>
          <div className="mt-4 flex flex-wrap gap-3 text-sm font-bold">
            <Link className="rounded-full border border-emerald-200 bg-white px-4 py-2 text-emerald-700 shadow-sm" href="/refund/amazon-refund-not-received">{copy.primaryCta || 'Amazon refund guide'}</Link>
            <Link className="rounded-full border border-emerald-200 bg-white px-4 py-2 text-emerald-700 shadow-sm" href="/refund/flipkart-refund-complaint">{copy.secondaryCta || 'Flipkart refund guide'}</Link>
          </div>
        </div>
        <ComplaintGenerator />
      </section>
    </main>
  )
}
