import { ChargebackHelperForm } from '@/components/forms/chargeback-helper-form'

export const metadata = { title: 'Chargeback / Payment Dispute Helper | HaqSathi AI', description: 'Bank/card/UPI payment dispute ke liye chargeback-style request, proof checklist aur escalation plan.' }

export default function Page() {
  return <main className="bg-slate-50"><section className="mx-auto max-w-7xl px-4 py-12"><p className="text-sm font-bold uppercase tracking-wider text-primary">Phase 31 tool</p><h1 className="mt-2 text-4xl font-black tracking-tight text-slate-950">Chargeback / Payment Dispute Helper</h1><p className="mt-3 max-w-3xl text-slate-600">Bank/card/UPI payment dispute ke liye chargeback-style request, proof checklist aur escalation plan.</p><div className="mt-8"><ChargebackHelperForm /></div></section></main>
}
