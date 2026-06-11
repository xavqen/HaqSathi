import Link from 'next/link'
import { FileArchive, ShieldCheck } from 'lucide-react'
import { ProofFileOrganizerForm } from '@/components/forms/proof-file-organizer-form'

export const metadata = {
  title: 'Proof File Organizer | HaqSathi AI',
  description: 'Organize complaint evidence files, folder names, redacted sharing pack and missing proof checklist.'
}

export default function ProofFileOrganizerPage() {
  return (
    <main className="bg-slate-50">
      <section className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
        <div className="rounded-[2rem] border border-emerald-100 bg-white p-6 shadow-soft sm:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm font-black text-emerald-800"><FileArchive className="h-5 w-5" /> New evidence tool</div>
              <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-5xl">Proof file organizer</h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600 sm:text-lg">
                Convert scattered screenshots, invoices, receipts, chats and acknowledgements into a clean folder plan, safe file names, missing proof list and copy-ready proof index.
              </p>
            </div>
            <Link href="/tools/evidence-timeline-builder" className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-800 hover:bg-slate-50 lg:w-auto">
              Open timeline builder
            </Link>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {[
            ['Clean naming', 'Create numbered, date-based file names that are easy for banks, support teams and offices to understand.'],
            ['Redacted pack', 'Separate originals from shareable copies so private data is not leaked.'],
            ['Missing proof', 'See what proof is still weak before submitting a complaint or escalation.']
          ].map(([title, desc]) => (
            <div key={title} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft">
              <ShieldCheck className="h-5 w-5 text-emerald-700" />
              <h2 className="mt-2 font-black text-slate-950">{title}</h2>
              <p className="mt-1 text-sm leading-6 text-slate-600">{desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <ProofFileOrganizerForm />
        </div>
      </section>
    </main>
  )
}
