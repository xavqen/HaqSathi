import { OmbudsmanPlannerForm } from '@/components/forms/ombudsman-planner-form'

export const metadata = { title: 'Ombudsman Escalation Planner | HaqSathi AI', description: 'Bank, refund, wallet aur service complaints ke liye safe ombudsman escalation plan.' }

export default function Page() {
  return <main className="bg-slate-50"><section className="mx-auto max-w-5xl px-4 py-12"><p className="text-sm font-bold uppercase tracking-wider text-primary">Escalation tool</p><h1 className="mt-2 text-4xl font-black tracking-tight text-slate-950">Ombudsman planner</h1><p className="mt-3 max-w-2xl text-slate-600">Ye tool aapka complaint record, evidence aur next steps arrange karta hai. Ye legal advice nahi hai; final submission se pehle official portal verify karein.</p><div className="mt-8"><OmbudsmanPlannerForm /></div></section></main>
}
