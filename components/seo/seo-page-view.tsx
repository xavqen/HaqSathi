import Link from 'next/link'
import { FaqSchema } from '@/components/seo/faq-schema'
import type { SeoSeedPage } from '@/lib/seo/seed-pages'

export function SeoPageView({ page }: { page: SeoSeedPage }) {
  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      <FaqSchema faqs={page.faqs} />
      <div className="rounded-3xl bg-emerald-50 p-6">
        <p className="text-sm font-semibold text-emerald-800">HaqSathi Guide</p>
        <h1 className="mt-2 text-4xl font-black tracking-tight">{page.h1}</h1>
        <p className="mt-4 text-lg text-slate-700">{page.intro}</p>
        <Link href="/complaint" className="mt-6 inline-flex rounded-xl bg-primary px-5 py-3 font-semibold text-primary-foreground">Generate My Complaint</Link>
      </div>

      <article className="prose-lite mt-10">
        <h2>Step-by-step guide</h2>
        <ul>{page.steps.map((step) => <li key={step}>{step}</li>)}</ul>
        <h2>Required documents/proof</h2>
        <ul>{page.documents.map((doc) => <li key={doc}>{doc}</li>)}</ul>
        <h2>Complaint format</h2>
        <p className="rounded-2xl bg-slate-50 p-4">{page.complaintFormat}</p>
        <h2>FAQ</h2>
        {page.faqs.map((faq) => <div key={faq.question}><h3>{faq.question}</h3><p>{faq.answer}</p></div>)}
        <div className="mt-8 rounded-2xl bg-amber-50 p-4 text-sm text-amber-900">Disclaimer: Ye legal advice nahi hai. Official portal/company support par details verify karein.</div>
      </article>
    </main>
  )
}
