import Link from 'next/link'
import { requireUser } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { CopyButton } from '@/components/ui/copy-button'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Submission Packs | Dashboard' }

type PackShape = { title?: string; emailSubject?: string; emailBody?: string; whatsappMessage?: string; recommendedChannel?: string }

export default async function Page() {
  const user = await requireUser()
  const packs = await db.submissionPack.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' }, take: 30 }).catch(() => [])
  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] bg-gradient-to-br from-slate-950 to-emerald-950 p-6 text-white shadow-soft">
        <p className="text-sm font-bold uppercase tracking-wider text-emerald-200">Dashboard</p>
        <h1 className="mt-2 text-3xl font-black">Submission Packs</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-emerald-50">Saved email, WhatsApp, call and escalation packs. Mobile se copy karke official channels par send karo.</p>
        <Link href="/tools/submission-pack" className="mt-4 inline-flex rounded-2xl bg-white px-5 py-3 text-sm font-black text-slate-950">Create new pack</Link>
      </div>
      <div className="grid gap-4">
        {packs.length ? packs.map((item) => {
          const pack = item.pack as PackShape
          return <div key={item.id} className="rounded-3xl border bg-white p-5 shadow-soft">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div><p className="text-xs font-bold uppercase tracking-wider text-emerald-700">{item.issueType} · {item.recipientType}</p><h2 className="mt-1 text-xl font-black">{pack.title || item.companyName || 'Submission pack'}</h2><p className="mt-1 text-sm text-slate-500">{item.createdAt.toLocaleString()}</p></div>
              <Link href="/tools/submission-pack" className="rounded-2xl border px-4 py-2 text-sm font-bold">Create another</Link>
            </div>
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-4"><div className="mb-2 flex justify-between gap-2"><b>Email</b><CopyButton text={`${pack.emailSubject || ''}\n\n${pack.emailBody || ''}`} /></div><p className="text-sm font-bold text-slate-700">{pack.emailSubject}</p><pre className="mt-2 max-h-56 overflow-auto whitespace-pre-wrap text-sm leading-6 text-slate-600">{pack.emailBody}</pre></div>
              <div className="rounded-2xl bg-slate-50 p-4"><div className="mb-2 flex justify-between gap-2"><b>WhatsApp</b><CopyButton text={pack.whatsappMessage || ''} /></div><pre className="max-h-56 overflow-auto whitespace-pre-wrap text-sm leading-6 text-slate-600">{pack.whatsappMessage}</pre></div>
            </div>
          </div>
        }) : <div className="rounded-3xl border bg-white p-8 text-center shadow-soft"><h2 className="text-2xl font-black">No submission pack yet</h2><p className="mt-2 text-sm text-slate-600">Pehla pack create karo aur mobile se copy/send karo.</p><Link href="/tools/submission-pack" className="mt-4 inline-flex rounded-2xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground">Create pack</Link></div>}
      </div>
    </div>
  )
}
