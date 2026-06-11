import Link from 'next/link'
import { AlertTriangle, Banknote, ShieldCheck } from 'lucide-react'
import { BankAccountFreezePlannerForm } from '@/components/forms/bank-account-freeze-planner-form'

export const metadata = {
  title: 'Bank Account Freeze Planner | HaqSathi AI',
  description: 'Plan bank account freeze, lien, hold, KYC freeze, UPI dispute hold, ATM cash not dispensed and wrong debit escalation with proof checklist and safe copy-ready message.'
}

export default function BankAccountFreezePlannerPage() {
  return (
    <main className="bg-slate-50">
      <section className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
        <div className="rounded-[2rem] border border-emerald-100 bg-white p-6 shadow-soft sm:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm font-black text-emerald-800"><Banknote className="h-5 w-5" /> New bank safety helper</div>
              <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-5xl">Bank account freeze planner</h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600 sm:text-lg">
                Plan account freeze, lien, balance hold, KYC freeze, UPI dispute hold, ATM debit and wrong debit complaints with proof checklist, safe escalation route and copy-ready bank message.
              </p>
            </div>
            <Link href="/tools/bank-escalation" className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-800 hover:bg-slate-50 lg:w-auto">
              Bank escalation planner
            </Link>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {[
            ['Written reason', 'Ask bank for freeze/lien/hold reason, reference and expected resolution timeline in writing.'],
            ['Proof pack', 'Keep redacted statement, notice, UTR/reference ID, complaint ID and branch/support responses.'],
            ['Secret safety', 'Never share OTP, UPI PIN, CVV, password, full account/card number or remote access.']
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
          <p className="mt-1">This tool gives guidance only. Verify final action with your bank, official authority or expert. Do not pay random agents or click suspicious links claiming to unfreeze accounts.</p>
        </div>

        <div className="mt-6">
          <BankAccountFreezePlannerForm />
        </div>
      </section>
    </main>
  )
}
