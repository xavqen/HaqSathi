import Link from 'next/link'
import { CalendarClock, ShieldCheck } from 'lucide-react'
import { DocumentExpiryPlannerForm } from '@/components/forms/document-expiry-planner-form'

export const metadata = {
  title: 'Document Expiry & Renewal Planner',
  description: 'Plan passport, driving license, insurance, scholarship and certificate renewal reminders safely.'
}

export default function DocumentExpiryPlannerPage() {
  return (
    <main className="bg-slate-50">
      <section className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
        <div className="rounded-[2rem] border border-emerald-100 bg-white p-6 shadow-soft sm:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm font-black text-emerald-800"><CalendarClock className="h-5 w-5" /> New practical tool</div>
              <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-5xl">Document expiry & renewal planner</h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600 sm:text-lg">
                Track passport, driving license, insurance, certificates and scholarship documents before they expire. Get reminder dates, checklist and official-only safety warnings.
              </p>
            </div>
            <Link href="/documents" className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-800 hover:bg-slate-50 lg:w-auto">
              Open document checklist
            </Link>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {[
            ['No secrets needed', 'Only date + document type. No Aadhaar/OTP/bank data required.'],
            ['Renewal window', 'Know when to start before portal rush or last-minute expiry.'],
            ['Proof checklist', 'Keep receipts, acknowledgement and official status screenshots ready.']
          ].map(([title, desc]) => (
            <div key={title} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft">
              <ShieldCheck className="h-5 w-5 text-emerald-700" />
              <h2 className="mt-2 font-black text-slate-950">{title}</h2>
              <p className="mt-1 text-sm leading-6 text-slate-600">{desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <DocumentExpiryPlannerForm />
        </div>
      </section>
    </main>
  )
}
