import { PrivacyRedactorForm } from '@/components/forms/privacy-redactor-form'

export const metadata = { title: 'Privacy Redactor | HaqSathi AI', description: 'Remove phone, email, UPI ID, account details and risky allegations before sharing complaint drafts publicly.' }

export default function Page() {
  return <main className="bg-slate-50"><section className="mx-auto max-w-7xl px-4 py-12"><p className="text-sm font-bold uppercase tracking-wider text-primary">Phase 30 trust tool</p><h1 className="mt-2 text-4xl font-black tracking-tight text-slate-950">Privacy Redactor</h1><p className="mt-3 max-w-3xl text-slate-600">Remove phone, email, UPI ID, account details and risky allegations before sharing complaint drafts publicly.</p><div className="mt-8"><PrivacyRedactorForm /></div></section></main>
}
