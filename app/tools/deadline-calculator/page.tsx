import { DeadlineCalculatorForm } from '@/components/forms/deadline-calculator-form'
export const metadata = { title: 'Complaint Deadline Calculator', description: 'Complaint follow-up and escalation timeline calculator.' }
export default function Page() { return <main className="bg-slate-50"><section className="mx-auto max-w-4xl px-4 py-12"><h1 className="text-4xl font-black">Complaint Deadline Calculator</h1><p className="mt-3 text-slate-600">Issue date dalo, tool aapko follow-up aur escalation dates dega.</p><div className="mt-8"><DeadlineCalculatorForm /></div></section></main> }
