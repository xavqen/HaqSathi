import { OcrAutofillForm } from '@/components/forms/ocr-autofill-form'

export const metadata = {
  title: 'OCR Autofill Complaint Form | HaqSathi AI',
  description: 'Upload payment screenshot, invoice or support proof and autofill complaint fields with AI vision OCR.'
}

export default function Page() {
  return (
    <main className="bg-slate-50">
      <section className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
        <div className="rounded-[2rem] bg-gradient-to-br from-slate-950 via-cyan-950 to-emerald-900 p-5 text-white shadow-soft sm:p-8">
          <p className="text-sm font-bold uppercase tracking-wider text-emerald-200">Phase 26 · OCR autofill</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-5xl">Upload proof → autofill complaint</h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-emerald-50 sm:text-base">Payment screenshot, invoice, order proof ya support chat upload karo. AI company, amount, date, order/transaction ID aur complaint type extract karke complaint generator me one-click bhejega.</p>
          <div className="mt-5 grid gap-3 text-sm sm:grid-cols-3">
            <div className="rounded-2xl bg-white/10 p-4">Image OCR with OpenAI/Gemini vision when keys are configured</div>
            <div className="rounded-2xl bg-white/10 p-4">Fallback heuristic works without paid AI keys</div>
            <div className="rounded-2xl bg-white/10 p-4">Mobile-first upload, preview and copy-ready fields</div>
          </div>
        </div>
        <div className="mt-6"><OcrAutofillForm /></div>
      </section>
    </main>
  )
}
