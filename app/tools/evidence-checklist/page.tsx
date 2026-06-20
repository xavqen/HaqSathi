import { EvidenceChecklistForm } from '@/components/forms/evidence-checklist-form'
export const metadata = { title: 'Evidence Checklist Generator', description: 'Generate required proof checklist for complaint, fraud, scheme and documents.' }
export default function Page() { return <main className="bg-slate-50"><section className="mx-auto max-w-4xl px-4 py-12"><h1 className="text-4xl font-black">Evidence Checklist</h1><p className="mt-3 text-slate-600">Kis proof ki zarurat hogi, simple checklist me dekho.</p><div className="mt-8"><EvidenceChecklistForm /></div></section></main> }
