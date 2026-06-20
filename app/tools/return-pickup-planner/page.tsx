import Link from 'next/link'
import { PackageCheck, ShieldCheck } from 'lucide-react'
import { ReturnPickupPlannerForm } from '@/components/forms/return-pickup-planner-form'

export const metadata = {
  title: 'Return Pickup Planner',
  description: 'Plan online shopping return pickup, refund proof, safe escalation and copy-ready support message.'
}

export default function ReturnPickupPlannerPage() {
  return (
    <main className="bg-slate-50">
      <section className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
        <div className="rounded-[2rem] border border-emerald-100 bg-white p-6 shadow-soft sm:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm font-black text-emerald-800"><PackageCheck className="h-5 w-5" /> New shopping tool</div>
              <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-5xl">Return pickup planner</h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600 sm:text-lg">
                Plan return/refund deadlines, pickup proof, escalation route and copy-ready support message for wrong, damaged, missing or delayed online orders.
              </p>
            </div>
            <Link href="/tools/proof-file-organizer" className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-800 hover:bg-slate-50 lg:w-auto">
              Organize proof files
            </Link>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {[
            ['Return-window ready', 'Estimate deadline and urgency before the return window closes.'],
            ['Pickup proof map', 'Know what to photograph and what receipt/tracking proof to keep.'],
            ['Refund scam safe', 'Warns against OTP, UPI PIN, CVV, password and screen-sharing fraud.']
          ].map(([title, desc]) => (
            <div key={title} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft">
              <ShieldCheck className="h-5 w-5 text-emerald-700" />
              <h2 className="mt-2 font-black text-slate-950">{title}</h2>
              <p className="mt-1 text-sm leading-6 text-slate-600">{desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <ReturnPickupPlannerForm />
        </div>
      </section>
    </main>
  )
}
