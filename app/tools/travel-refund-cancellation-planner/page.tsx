import Link from 'next/link'
import { AlertTriangle, Plane, ShieldCheck } from 'lucide-react'
import { TravelRefundCancellationPlannerForm } from '@/components/forms/travel-refund-cancellation-planner-form'

export const metadata = {
  title: 'Travel Refund & Cancellation Planner',
  description: 'Plan train, flight, bus, hotel and travel booking refunds with proof checklist, escalation route and safe copy-ready message.'
}

export default function TravelRefundCancellationPlannerPage() {
  return (
    <main className="bg-slate-50">
      <section className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
        <div className="rounded-[2rem] border border-emerald-100 bg-white p-6 shadow-soft sm:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm font-black text-emerald-800"><Plane className="h-5 w-5" /> New refund helper</div>
              <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-5xl">Travel refund & cancellation planner</h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600 sm:text-lg">
                Plan train, flight, bus, hotel, cab, tour package or travel service refund disputes with pending amount estimate, proof checklist, escalation route and safe copy-ready message.
              </p>
            </div>
            <Link href="/tools/proof-file-organizer" className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-800 hover:bg-slate-50 lg:w-auto">
              Organize proof files
            </Link>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {[
            ['Pending amount estimate', 'Compare amount paid and refund received to calculate disputed amount.'],
            ['Policy + proof pack', 'Collect booking, cancellation, policy, payment and support response proof.'],
            ['Safe refund copy', 'Create a calm written request without sharing OTP, CVV, UPI PIN or login details.']
          ].map(([title, desc]) => (
            <div key={title} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft">
              <ShieldCheck className="h-5 w-5 text-emerald-700" />
              <h2 className="mt-2 font-black text-slate-950">{title}</h2>
              <p className="mt-1 text-sm leading-6 text-slate-600">{desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
          <div className="flex gap-2 font-black"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> Safety note</div>
          <p className="mt-1">Guidance only. Use official app/provider/bank channels. Never share OTP, CVV, UPI PIN, card PIN, password, full bank details or screen-share access for refunds.</p>
        </div>

        <div className="mt-6">
          <TravelRefundCancellationPlannerForm />
        </div>
      </section>
    </main>
  )
}
