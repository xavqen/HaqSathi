import type { Metadata } from 'next'
import { ComplaintGenerator } from '@/components/forms/complaint-generator'
import { getCurrentPageCopy } from '@/lib/i18n/page-copy'

export const metadata: Metadata = {
  title: 'AI Complaint Generator',
  description: 'Create refund, UPI, bank debit, wrong item and service issue complaint drafts in simple English.'
}
export const dynamic = 'force-dynamic'

export default async function ComplaintPage() {
  const copy = (await getCurrentPageCopy()).complaint
  return (
    <main className="bg-slate-50">
      <section className="hs-container py-8 sm:py-12">
        <div className="mb-6 max-w-3xl sm:mb-8">
          <p className="text-sm font-black uppercase tracking-wider text-emerald-700">{copy.kicker}</p>
          <h1 className="mt-2 text-[2.25rem] font-black leading-none tracking-tight text-slate-950 sm:text-5xl">{copy.title}</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">{copy.description}</p>
        </div>
        <ComplaintGenerator />
      </section>
    </main>
  )
}
