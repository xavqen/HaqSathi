import { ComplaintScoreForm } from '@/components/forms/complaint-score-form'
export const metadata = { title: 'Complaint Strength Checker | HaqSathi AI', description: 'Check if your complaint draft has enough details.' }
export default function Page() { return <main className="bg-slate-50"><section className="mx-auto max-w-4xl px-4 py-12"><h1 className="text-4xl font-black">Complaint Strength Checker</h1><p className="mt-3 text-slate-600">Draft bhejne se pehle missing details pakdo.</p><div className="mt-8"><ComplaintScoreForm /></div></section></main> }
