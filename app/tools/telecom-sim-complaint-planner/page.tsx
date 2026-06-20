import Link from 'next/link'
import { AlertTriangle, RadioTower, ShieldCheck } from 'lucide-react'
import { TelecomSimComplaintPlannerForm } from '@/components/forms/telecom-sim-complaint-planner-form'

export const metadata = {
  title: 'Telecom SIM Complaint Planner',
  description: 'Plan recharge, bill, SIM, porting, KYC misuse and telecom support complaints with proof checklist, escalation route and safe copy-ready message.'
}

export default function TelecomSimComplaintPlannerPage() {
  return (
    <main className="bg-slate-50">
      <section className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
        <div className="rounded-[2rem] border border-emerald-100 bg-white p-6 shadow-soft sm:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm font-black text-emerald-800"><RadioTower className="h-5 w-5" /> New telecom helper</div>
              <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-5xl">Telecom SIM complaint planner</h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600 sm:text-lg">
                Plan recharge failed, data/balance deduction, postpaid bill overcharge, SIM block, porting/MNP, KYC misuse and spam/scam telecom complaints with safe proof checklist and copy-ready message.
              </p>
            </div>
            <Link href="/tools/privacy-redactor" className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-800 hover:bg-slate-50 lg:w-auto">
              Redact proof safely
            </Link>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {[
            ['Recharge + bill proof', 'Collect payment IDs, app screenshots, bill PDFs and operator response.'],
            ['SIM/KYC safety', 'Avoid OTP, SIM swap code, full ID details and random refund links.'],
            ['Official escalation', 'Use operator app, website, store, grievance desk and payment-app route when valid.']
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
          <p className="mt-1">Never share OTP, SIM swap/porting OTP, UPI PIN, CVV, password or full ID details. Open official operator app/website yourself instead of clicking random refund links.</p>
        </div>

        <div className="mt-6">
          <TelecomSimComplaintPlannerForm />
        </div>
      </section>
    </main>
  )
}
