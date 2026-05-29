import { requireAdmin } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const dynamic = 'force-dynamic'
export default async function Page() {
  await requireAdmin()
  const [parsedDocs, coachReports, followUps] = await Promise.all([
    db.documentParseResult.count().catch(() => 0),
    db.caseCoachReport.count().catch(() => 0),
    db.followUpAutomation.count().catch(() => 0)
  ])
  return <div><h1 className="text-3xl font-black">Automation intelligence</h1><p className="mt-2 text-slate-600">Phase 24 usage overview.</p><div className="mt-6 grid gap-4 md:grid-cols-3"><Metric title="Document reads" value={parsedDocs} /><Metric title="Case coach reports" value={coachReports} /><Metric title="Follow-up plans" value={followUps} /></div></div>
}
function Metric({ title, value }: { title: string; value: number }) { return <Card><CardHeader><CardTitle>{title}</CardTitle></CardHeader><CardContent><p className="text-4xl font-black text-primary">{value}</p></CardContent></Card> }
