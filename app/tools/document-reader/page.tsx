import { DocumentReaderForm } from '@/components/forms/document-reader-form'

export const metadata = {
  title: 'AI Document Reader',
  description: 'Invoice, SMS, email ya chat text se amount, date, order ID aur company auto-detect karo.'
}

export default function Page() {
  return (
    <main className="bg-slate-50">
      <section className="mx-auto max-w-5xl px-4 py-10 sm:py-14">
        <div className="rounded-[2rem] bg-gradient-to-br from-slate-950 to-emerald-900 p-5 text-white shadow-soft sm:p-8">
          <p className="text-sm font-bold uppercase tracking-wider text-emerald-200">Phase 24 · Smart autofill</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-5xl">AI Document Reader</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-emerald-50 sm:text-base">Invoice, bank SMS, support email ya chat ka text paste karo. System amount, date, company, transaction/order ID detect karke complaint form ke liye ready fields dega.</p>
        </div>
        <div className="mt-6"><DocumentReaderForm /></div>
      </section>
    </main>
  )
}
