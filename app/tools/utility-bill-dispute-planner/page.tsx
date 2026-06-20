import Link from 'next/link'
import { Gauge, ShieldCheck } from 'lucide-react'
import { UtilityBillDisputePlannerForm } from '@/components/forms/utility-bill-dispute-planner-form'

export const metadata = {
  title: 'Utility Bill Dispute Planner',
  description: 'Plan electricity, water, gas, broadband or mobile postpaid bill disputes with proof checklist, escalation route and copy-ready complaint.'
}

export default function UtilityBillDisputePlannerPage() {
  return (
    <main className="bg-slate-50">
      <section className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
        <div className="rounded-[2rem] border border-emerald-100 bg-white p-6 shadow-soft sm:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm font-black text-emerald-800"><Gauge className="h-5 w-5" /> New bill dispute tool</div>
              <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-5xl">Utility bill dispute planner</h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600 sm:text-lg">
                Plan electricity, water, gas, broadband, DTH or mobile postpaid bill disputes with proof checklist, escalation route and copy-ready complaint message.
              </p>
            </div>
            <Link href="/tools/call-visit-logbook" className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-800 hover:bg-slate-50 lg:w-auto">
              Log calls/visits
            </Link>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {[
            ['Overcharge estimate', 'Compare current amount with usual bill and flag urgency.'],
            ['Meter/payment proof', 'Know what to capture before provider escalation.'],
            ['Secret-safe complaint', 'Warns against OTP, UPI PIN, CVV, password and screen-sharing scams.']
          ].map(([title, desc]) => (
            <div key={title} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft">
              <ShieldCheck className="h-5 w-5 text-emerald-700" />
              <h2 className="mt-2 font-black text-slate-950">{title}</h2>
              <p className="mt-1 text-sm leading-6 text-slate-600">{desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <UtilityBillDisputePlannerForm />
        </div>
      </section>
    </main>
  )
}
