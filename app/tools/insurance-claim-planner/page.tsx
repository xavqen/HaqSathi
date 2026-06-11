import Link from 'next/link'
import { ShieldCheck, Umbrella } from 'lucide-react'
import { InsuranceClaimPlannerForm } from '@/components/forms/insurance-claim-planner-form'

export const metadata = {
  title: 'Insurance Claim Planner | HaqSathi AI',
  description: 'Plan vehicle, health, travel, phone, appliance and other insurance claims with proof checklist, escalation route and safe copy-ready message.'
}

export default function InsuranceClaimPlannerPage() {
  return (
    <main className="bg-slate-50">
      <section className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
        <div className="rounded-[2rem] border border-emerald-100 bg-white p-6 shadow-soft sm:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm font-black text-emerald-800"><Umbrella className="h-5 w-5" /> New claim tool</div>
              <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-5xl">Insurance claim planner</h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600 sm:text-lg">
                Organize vehicle, health, travel, device, appliance and other insurance claims with proof checklist, escalation route and a safe copy-ready message.
              </p>
            </div>
            <Link href="/tools/proof-file-organizer" className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-800 hover:bg-slate-50 lg:w-auto">
              Organize proof files
            </Link>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {[
            ['Claim proof map', 'Know which policy, bill, report, photo and communication proof to keep.'],
            ['Safe escalation copy', 'Create a factual message for insurer, TPA or grievance desk.'],
            ['Fraud-safe warnings', 'Avoid OTP, UPI PIN, CVV, remote screen access and fake settlement links.']
          ].map(([title, desc]) => (
            <div key={title} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft">
              <ShieldCheck className="h-5 w-5 text-emerald-700" />
              <h2 className="mt-2 font-black text-slate-950">{title}</h2>
              <p className="mt-1 text-sm leading-6 text-slate-600">{desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
          <strong>Guidance only:</strong> This tool helps organize claim communication and proof. Insurance policy terms, official insurer rules and qualified advice decide the actual outcome.
        </div>

        <div className="mt-6">
          <InsuranceClaimPlannerForm />
        </div>
      </section>
    </main>
  )
}
