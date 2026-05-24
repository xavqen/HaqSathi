import { requireAdmin } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Compliance | Admin | HaqSathi AI' }

export default async function AdminCompliancePage() {
  await requireAdmin()
  const [consents, deletionRequests, exportsCount] = await Promise.all([
    db.privacyConsent.findMany({ include: { user: { select: { email: true, name: true } } }, orderBy: { createdAt: 'desc' }, take: 50 }),
    db.dataDeletionRequest.findMany({ include: { user: { select: { email: true, name: true } } }, orderBy: { createdAt: 'desc' }, take: 50 }),
    db.dataExport.count()
  ])

  return <div className="space-y-6">
    <div>
      <h1 className="text-3xl font-bold">Compliance center</h1>
      <p className="mt-2 text-slate-600">Consent logs, deletion requests aur user exports monitor karo.</p>
    </div>
    <div className="grid gap-4 md:grid-cols-3">
      <Card><CardHeader><CardTitle>Consent events</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{consents.length}</p></CardContent></Card>
      <Card><CardHeader><CardTitle>Deletion requests</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{deletionRequests.length}</p></CardContent></Card>
      <Card><CardHeader><CardTitle>Exports</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{exportsCount}</p></CardContent></Card>
    </div>
    <Card><CardHeader><CardTitle>Pending deletion requests</CardTitle></CardHeader><CardContent className="space-y-3">
      {deletionRequests.length === 0 && <p className="text-sm text-slate-600">No deletion requests.</p>}
      {deletionRequests.map((r) => <div key={r.id} className="rounded-2xl border p-4 text-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"><b>{r.user.name || r.user.email}</b><Badge>{r.status}</Badge></div>
        <p className="mt-1 text-slate-600">{r.reason || 'No reason'} · {r.createdAt.toDateString()}</p>
      </div>)}
    </CardContent></Card>
    <Card><CardHeader><CardTitle>Latest consent events</CardTitle></CardHeader><CardContent className="space-y-3">
      {consents.map((c) => <div key={c.id} className="rounded-2xl border p-4 text-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"><b>{c.type}</b><Badge>{c.granted ? 'Allowed' : 'Disabled'}</Badge></div>
        <p className="mt-1 text-slate-600">{c.user.name || c.user.email} · {c.createdAt.toDateString()}</p>
      </div>)}
    </CardContent></Card>
  </div>
}
