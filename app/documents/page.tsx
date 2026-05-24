import type { Metadata } from 'next'
import { DocumentChecklistForm } from '@/components/forms/document-checklist'

export const metadata: Metadata = { title: 'Document Checklist Generator', description: 'Income, caste, domicile, PAN, Aadhaar, scholarship and KYC checklist generator.' }

export default function Page() {
  return <main className="bg-slate-50"><section className="mx-auto max-w-7xl px-4 py-10"><div className="mb-8 max-w-3xl"><p className="text-sm font-semibold text-emerald-700">Document Helper</p><h1 className="mt-2 text-4xl font-black">Document Checklist Generator</h1><p className="mt-3 text-slate-600">Document type choose karo aur required documents, process, mistakes aur time estimate dekho.</p></div><DocumentChecklistForm /></section></main>
}
