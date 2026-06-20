import { LanguageDraftTranslatorForm } from '@/components/forms/language-draft-translator-form'

export const metadata = {
  title: 'Language Draft Translator',
  description: 'Complaint, refund, UPI and scheme messages ko English, Indian languages aur world languages me ready-to-copy format me convert karein.'
}

export default function Page() {
  return (
    <main className="bg-slate-50">
      <section className="mx-auto max-w-5xl px-4 py-10 sm:py-14">
        <div className="rounded-[2rem] bg-white p-5 shadow-soft sm:p-8">
          <p className="text-sm font-bold uppercase tracking-wider text-primary">Language assistant</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-5xl">Draft ko user ki language me simple banao</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">Primary language English hai, lekin user apni Indian ya world language choose kar sakta hai. IDs, amount, UTR aur official terms unchanged rehte hain.</p>
        </div>
        <div className="mt-6"><LanguageDraftTranslatorForm /></div>
      </section>
    </main>
  )
}
