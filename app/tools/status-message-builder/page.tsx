import { StatusMessageBuilderForm } from '@/components/forms/status-message-builder-form'
export const metadata = { title: 'Status Message Builder | HaqSathi AI', description: 'Complaint/application status follow-up message builder.' }
export default function Page(){ return <main className="bg-slate-50"><section className="mx-auto max-w-3xl px-4 py-12"><h1 className="text-4xl font-black">Status message builder</h1><p className="mt-3 text-slate-600">Support, bank, scheme office ke liye short follow-up messages.</p><div className="mt-8"><StatusMessageBuilderForm /></div></section></main> }
