import { ServiceCenterLocatorForm } from '@/components/forms/service-center-locator-form'

export const metadata = { title: 'Service Center Route Planner', description: 'City/state ke hisaab se online/offline authority route, questions aur visit checklist banao.' }

export default function Page() {
  return <main className="bg-slate-50"><section className="mx-auto max-w-7xl px-4 py-12"><p className="text-sm font-bold uppercase tracking-wider text-primary">Phase 31 tool</p><h1 className="mt-2 text-4xl font-black tracking-tight text-slate-950">Service Center Route Planner</h1><p className="mt-3 max-w-3xl text-slate-600">City/state ke hisaab se online/offline authority route, questions aur visit checklist banao.</p><div className="mt-8"><ServiceCenterLocatorForm /></div></section></main>
}
