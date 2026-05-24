import { db } from '@/lib/db'
import { requireUser } from '@/lib/auth/session'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CopyButton } from '@/components/ui/copy-button'
import { ComplaintActions } from '@/components/dashboard/complaint-actions'

export const dynamic = 'force-dynamic'
type Draft = { shortComplaint?: string; formalEmail?: string; followUpMessage?: string; disclaimer?: string }

export default async function Page() {
  const user = await requireUser()
  const complaints = await db.complaint.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' }, take: 50 })
  return <div><div className="flex flex-wrap items-start justify-between gap-3"><div><h1 className="text-3xl font-black">My Complaints</h1><p className="mt-2 text-slate-600">Status update, PDF export aur WhatsApp share yahin se karo.</p></div><a className="rounded-xl border bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50" href="/api/dashboard/export/complaints" download="haqsathi-my-complaints.csv">Export CSV</a></div><div className="mt-6 space-y-4">{complaints.length === 0 ? <Card><CardContent className="p-8 text-slate-500">Abhi complaint generate nahi hui.</CardContent></Card> : complaints.map((c) => { const draft = c.generatedDraft as Draft; const shareText = draft.shortComplaint || draft.formalEmail || ''; return <Card key={c.id}><CardHeader><div className="flex flex-wrap items-start justify-between gap-3"><div><CardTitle>{c.type} · {c.companyName}</CardTitle><p className="mt-1 text-sm text-slate-500">{c.createdAt.toDateString()} · Current: {c.status}</p></div><ComplaintActions id={c.id} status={c.status} shareText={shareText} /></div></CardHeader><CardContent className="space-y-3"><div className="rounded-xl bg-slate-50 p-4"><div className="mb-2 flex items-center justify-between"><b>Short complaint</b><CopyButton text={draft.shortComplaint || ''} /></div><p className="whitespace-pre-wrap text-sm">{draft.shortComplaint}</p></div>{draft.formalEmail && <details className="rounded-xl bg-white p-4 ring-1 ring-slate-200"><summary className="cursor-pointer font-bold">Formal Email</summary><p className="mt-3 whitespace-pre-wrap text-sm">{draft.formalEmail}</p></details>}{draft.followUpMessage && <div className="rounded-xl bg-white p-4 ring-1 ring-slate-200"><div className="mb-2 flex items-center justify-between"><b>Follow-up</b><CopyButton text={draft.followUpMessage} /></div><p className="whitespace-pre-wrap text-sm">{draft.followUpMessage}</p></div>}</CardContent></Card> })}</div></div>
}
