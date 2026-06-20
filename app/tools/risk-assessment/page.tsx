import { RiskAssessmentForm } from '@/components/forms/risk-assessment-form'
export const metadata = { title: 'Risk Assessment Tool', description: 'Assess urgency for UPI fraud, refund delay or bank issue.' }
export default function Page() { return <main className="bg-slate-50"><section className="mx-auto max-w-4xl px-4 py-12"><h1 className="text-4xl font-black">Risk Assessment</h1><p className="mt-3 text-slate-600">Urgency level samjho: low, medium, high, urgent.</p><div className="mt-8"><RiskAssessmentForm /></div></section></main> }
