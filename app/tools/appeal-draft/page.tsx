import { AppealDraftForm } from '@/components/forms/appeal-draft-form'
export const metadata = { title: 'Appeal Draft Helper | HaqSathi AI', description: 'Application, scheme, refund ya complaint follow-up ke liye simple appeal draft.' }
export default function Page(){ return <main className="bg-slate-50"><section className="mx-auto max-w-3xl px-4 py-12"><h1 className="text-4xl font-black">Appeal / follow-up draft</h1><p className="mt-3 text-slate-600">Authority ko polite written follow-up bhejne ke liye draft ready karo.</p><div className="mt-8"><AppealDraftForm /></div></section></main> }
