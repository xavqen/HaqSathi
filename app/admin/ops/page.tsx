import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth/session'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const dynamic = 'force-dynamic'
export default async function OpsPage() {
  await requireAdmin()
  const stats = await Promise.all([
    db.legalToolResult.count(),
    db.evidencePack.count(),
    db.savedOfficialLink.count(),
    db.riskAssessment.count(),
    db.supportTicket.count({ where: { status: 'OPEN' } })
  ]).catch(() => [0,0,0,0,0])
  const rows = [['Legal tool runs', stats[0]], ['Evidence packs', stats[1]], ['Saved links', stats[2]], ['Risk reports', stats[3]], ['Open support tickets', stats[4]]]
  return <div><h1 className="text-4xl font-black">Operations Center</h1><p className="mt-2 text-slate-600">Launch ke baad important operational metrics yahan monitor karo.</p><div className="mt-8 grid gap-5 md:grid-cols-3">{rows.map(([label, value]) => <Card key={label}><CardHeader><CardTitle className="text-base">{label}</CardTitle></CardHeader><CardContent><div className="text-3xl font-black">{value}</div></CardContent></Card>)}</div></div>
}
