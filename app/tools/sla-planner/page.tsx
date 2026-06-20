import { Metadata } from 'next'
import { SlaPlannerPublicForm } from '@/components/forms/sla-planner-public-form'

export const metadata: Metadata = { title: 'Complaint SLA Planner', description: 'Generate safe follow-up timeline for refund, bank, UPI and cyber complaint cases.' }

export default function SlaPlannerPage() {
  return <main className="mx-auto grid max-w-6xl gap-8 px-4 py-12 lg:grid-cols-[0.85fr_1.15fr]"><section><p className="text-sm font-bold uppercase tracking-wider text-primary">Deadline planner</p><h1 className="mt-2 text-4xl font-black tracking-tight">Complaint follow-up timeline banao</h1><p className="mt-3 text-slate-600">Basic timeline generate karein. Cyber fraud case me official emergency channel immediately use karein.</p></section><SlaPlannerPublicForm /></main>
}
