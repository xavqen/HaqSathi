import type { Metadata } from 'next'
import { ComplaintGenerator } from '@/components/forms/complaint-generator'

export const metadata: Metadata = {
  title: 'AI Complaint Generator',
  description: 'Refund, UPI, bank debit, wrong item and service issue complaint drafts in simple Hinglish.'
}

export default function ComplaintPage() {
  return (
    <main className="bg-slate-50">
      <section className="mx-auto max-w-7xl px-4 py-10">
        <div className="mb-8 max-w-3xl">
          <p className="text-sm font-semibold text-emerald-700">Free AI Tool</p>
          <h1 className="mt-2 text-4xl font-black tracking-tight">AI Complaint Generator</h1>
          <p className="mt-3 text-slate-600">Complaint type choose karo, details fill karo, aur copy-ready complaint/email/follow-up draft pao.</p>
        </div>
        <ComplaintGenerator />
      </section>
    </main>
  )
}
