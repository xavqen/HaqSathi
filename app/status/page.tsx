import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const metadata = { title: 'HaqSathi AI Status', description: 'Service status and safety notes for HaqSathi AI.' }

export default function Page() {
  return <main className="mx-auto max-w-4xl px-4 py-12"><h1 className="text-4xl font-black">Service Status</h1><p className="mt-3 text-slate-600">Health checklist for the local MVP. Attach a monitoring provider in production.</p><div className="mt-8 grid gap-5 md:grid-cols-3"><Card><CardHeader><CardTitle>Website</CardTitle></CardHeader><CardContent><p className="text-emerald-700 font-bold">Operational</p></CardContent></Card><Card><CardHeader><CardTitle>AI API</CardTitle></CardHeader><CardContent><p className="text-emerald-700 font-bold">Fallback-ready</p></CardContent></Card><Card><CardHeader><CardTitle>Database</CardTitle></CardHeader><CardContent><p className="text-emerald-700 font-bold">Prisma-ready</p></CardContent></Card></div><div className="mt-8 rounded-2xl bg-amber-50 p-4 text-sm text-amber-900">For cyber fraud emergencies, contact official helplines or portals immediately. HaqSathi is a guidance tool, not an official authority.</div></main>
}
