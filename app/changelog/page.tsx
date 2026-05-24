export const metadata = { title: 'HaqSathi AI Changelog', description: 'Latest product updates for HaqSathi AI.' }

const items = [
  ['Phase 4', 'Quota tracking, CSV exports, support tickets, security headers, route audit.'],
  ['Phase 3', 'PDF export, complaint status, family/agent/vault modules, Razorpay webhook shell.'],
  ['Phase 2', 'Auth, dashboard/admin, AI chat, reminders, scheme CRUD.'],
  ['Phase 1', 'Homepage, complaint generator, Prisma, seed pages.']
]

export default function Page() {
  return <main className="mx-auto max-w-4xl px-4 py-12"><div className="mb-6 rounded-3xl border bg-white p-6 shadow-soft"><p className="text-sm font-bold text-primary">Phase 9</p><h2 className="text-2xl font-black">Huge feature expansion</h2><p className="mt-2 text-slate-600">Added public tools, case command center, escalation plans, risk reports, language preferences, and admin growth intelligence.</p></div><h1 className="text-4xl font-black">Changelog</h1><div className="mt-8 space-y-4">{items.map(([title, body]) => <div key={title} className="rounded-2xl border bg-white p-5"><h2 className="font-black">{title}</h2><p className="mt-2 text-slate-600">{body}</p></div>)}</div></main>
}
