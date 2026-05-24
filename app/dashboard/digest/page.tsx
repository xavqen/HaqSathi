import Link from 'next/link'
import { addDays } from 'date-fns'
import { requireUser } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Weekly Digest | HaqSathi AI' }

export default async function DigestPage() {
  const user = await requireUser()
  const nextWeek = addDays(new Date(), 7)
  const [pendingReminders, openComplaints, recentRisks, documentsExpiring] = await Promise.all([
    db.reminder.findMany({ where: { userId: user.id, status: 'PENDING', dueDate: { lte: nextWeek } }, orderBy: { dueDate: 'asc' }, take: 8 }),
    db.complaint.findMany({ where: { userId: user.id, status: { in: ['DRAFT', 'SENT', 'FOLLOW_UP'] } }, orderBy: { updatedAt: 'desc' }, take: 8 }),
    db.riskAssessment.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' }, take: 5 }),
    db.documentVaultItem.findMany({ where: { userId: user.id, expiryDate: { lte: nextWeek } }, orderBy: { expiryDate: 'asc' }, take: 5 })
  ])

  return <div className="space-y-6">
    <div>
      <h1 className="text-3xl font-bold">Weekly action digest</h1>
      <p className="mt-2 text-slate-600">Is week ke important follow-ups, risks aur document expiry ek jagah.</p>
    </div>
    <div className="grid gap-4 md:grid-cols-4">
      <Card><CardHeader><CardTitle>Due reminders</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{pendingReminders.length}</p></CardContent></Card>
      <Card><CardHeader><CardTitle>Open complaints</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{openComplaints.length}</p></CardContent></Card>
      <Card><CardHeader><CardTitle>Risk reports</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{recentRisks.length}</p></CardContent></Card>
      <Card><CardHeader><CardTitle>Expiring docs</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{documentsExpiring.length}</p></CardContent></Card>
    </div>
    <Card><CardHeader><CardTitle>Recommended next actions</CardTitle></CardHeader><CardContent className="space-y-3">
      {pendingReminders.map((r) => <div key={r.id} className="rounded-2xl border p-4"><b>{r.title}</b><p className="text-sm text-slate-600">Due: {r.dueDate.toDateString()}</p></div>)}
      {openComplaints.slice(0, 3).map((c) => <div key={c.id} className="rounded-2xl border p-4"><b>{c.companyName}</b><p className="text-sm text-slate-600">Status: {c.status}. Follow-up draft generate karo.</p></div>)}
      {pendingReminders.length === 0 && openComplaints.length === 0 && <p className="text-sm text-slate-600">Koi urgent action nahi. New complaint ya checklist create kar sakte ho.</p>}
      <Link href="/dashboard/reminders" className="inline-flex rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground">Manage reminders</Link>
    </CardContent></Card>
  </div>
}
