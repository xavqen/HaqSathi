import { GrievanceRouteFinderForm } from '@/components/forms/grievance-route-finder-form'
export const metadata = { title: 'Grievance Route Finder', description: 'Complaint ko kis route se escalate karna hai, simple step-by-step guide.' }
export default function Page(){ return <main className="bg-slate-50"><section className="mx-auto max-w-3xl px-4 py-12"><h1 className="text-4xl font-black">Grievance route finder</h1><p className="mt-3 text-slate-600">Issue type choose karo aur basic escalation path dekho.</p><div className="mt-8"><GrievanceRouteFinderForm /></div></section></main> }
