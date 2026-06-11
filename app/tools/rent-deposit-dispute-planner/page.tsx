import Link from 'next/link'
import { Home, ShieldCheck } from 'lucide-react'
import { RentDepositDisputePlannerForm } from '@/components/forms/rent-deposit-dispute-planner-form'

export const metadata = {
  title: 'Rent Deposit Dispute Planner | HaqSathi AI',
  description: 'Plan security deposit, rent receipt, maintenance, notice period and landlord/broker disputes with proof checklist and safe copy-ready message.'
}

export default function RentDepositDisputePlannerPage() {
  return (
    <main className="bg-slate-50">
      <section className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
        <div className="rounded-[2rem] border border-emerald-100 bg-white p-6 shadow-soft sm:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm font-black text-emerald-800"><Home className="h-5 w-5" /> New tenant safety tool</div>
              <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-5xl">Rent deposit dispute planner</h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">Plan security deposit, rent receipt, maintenance, notice period and broker disputes with proof checklist, peaceful escalation route and copy-ready message.</p>
            </div>
            <Link href="/tools" className="inline-flex min-h-11 items-center justify-center rounded-xl border px-4 text-sm font-black text-slate-700 hover:bg-slate-50">All tools</Link>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-emerald-50 p-4"><p className="text-sm font-black text-emerald-900">Deposit proof</p><p className="mt-1 text-sm text-emerald-800">Agreement + payment + handover checklist.</p></div>
            <div className="rounded-2xl bg-slate-50 p-4"><p className="text-sm font-black text-slate-950">Peaceful escalation</p><p className="mt-1 text-sm text-slate-700">Written request, proof pack, mediation, expert route.</p></div>
            <div className="rounded-2xl bg-amber-50 p-4"><p className="text-sm font-black text-amber-900">Privacy safe</p><p className="mt-1 text-sm text-amber-800">Avoid address, phone and ID proof exposure.</p></div>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
          <div className="flex gap-2"><ShieldCheck className="mt-1 h-4 w-4 shrink-0" /><p><strong>Guidance only:</strong> rent/deposit rules depend on local law, agreement terms and evidence. For eviction, threats, illegal lockout or high-value disputes, consult local legal aid/expert.</p></div>
        </div>

        <div className="mt-6">
          <RentDepositDisputePlannerForm />
        </div>
      </section>
    </main>
  )
}
