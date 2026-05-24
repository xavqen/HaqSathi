import { db } from '@/lib/db'
import { requireUser } from '@/lib/auth/session'
import { CaseNoteForm } from '@/components/forms/case-note-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const dynamic = 'force-dynamic'
export default async function Page() {
  const user = await requireUser()
  const [notes, complaints] = await Promise.all([
    db.caseNote.findMany({ where: { userId: user.id }, include: { complaint: { select: { companyName: true, type: true } } }, orderBy: { createdAt: 'desc' }, take: 100 }),
    db.complaint.findMany({ where: { userId: user.id }, select: { id: true, type: true, companyName: true }, orderBy: { createdAt: 'desc' }, take: 50 })
  ])
  return <div><h1 className="text-3xl font-black">Case Notes</h1><p className="mt-2 text-slate-600">Calls, office replies, evidence notes aur follow-up facts safely save karo.</p><div className="mt-6 grid gap-6 lg:grid-cols-[380px_1fr]"><Card><CardHeader><CardTitle>Add Note</CardTitle></CardHeader><CardContent><CaseNoteForm complaints={complaints} /></CardContent></Card><Card><CardHeader><CardTitle>Saved Notes</CardTitle></CardHeader><CardContent className="space-y-3">{notes.length ? notes.map((note) => <div key={note.id} className="rounded-2xl border p-4"><div className="flex flex-wrap items-center gap-2"><b>{note.title}</b><Badge>{note.visibility}</Badge></div>{note.complaint && <p className="mt-1 text-sm text-slate-600">Linked: {note.complaint.companyName} · {note.complaint.type}</p>}<p className="mt-2 whitespace-pre-wrap text-sm">{note.body}</p><p className="mt-2 text-xs text-slate-500">{note.createdAt.toLocaleString('en-IN')}</p></div>) : <p className="text-slate-500">No notes yet.</p>}</CardContent></Card></div></div>
}
