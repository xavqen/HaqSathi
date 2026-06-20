import Link from 'next/link'
import { AlertTriangle, Boxes, ShieldCheck } from 'lucide-react'
import { CourierParcelDisputePlannerForm } from '@/components/forms/courier-parcel-dispute-planner-form'

export const metadata = {
  title: 'Courier Parcel Dispute Planner',
  description: 'Plan lost parcel, marked delivered not received, damaged parcel, wrong item, delayed delivery, pickup failure and courier scam complaints with proof checklist and safe copy-ready message.'
}

export default function CourierParcelDisputePlannerPage() {
  return (
    <main className="bg-slate-50">
      <section className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
        <div className="rounded-[2rem] border border-emerald-100 bg-white p-6 shadow-soft sm:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm font-black text-emerald-800"><Boxes className="h-5 w-5" /> New courier helper</div>
              <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-5xl">Courier parcel dispute planner</h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600 sm:text-lg">
                Plan lost parcel, marked delivered but not received, damaged package, wrong item, delayed delivery, pickup failure, COD issue and fake courier scam complaints with proof checklist and safe copy.
              </p>
            </div>
            <Link href="/tools/proof-file-organizer" className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-800 hover:bg-slate-50 lg:w-auto">
              Organize proof files
            </Link>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {[
            ['Tracking proof', 'Collect AWB, delivery proof/POD, last scan status and support ticket ID.'],
            ['Package proof', 'Keep invoice, package label, unboxing video, damaged/wrong item photos and pickup-ready proof.'],
            ['Scam safety', 'Avoid random customs, reschedule, refund or KYC links from SMS/WhatsApp.']
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
          <p className="mt-1">Never share delivery OTP, UPI PIN, CVV, password, full ID or remote screen access. Open official courier/platform app or website yourself instead of clicking random links.</p>
        </div>

        <div className="mt-6">
          <CourierParcelDisputePlannerForm />
        </div>
      </section>
    </main>
  )
}
