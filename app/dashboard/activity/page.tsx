import { requireUser } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const dynamic = 'force-dynamic'
export default async function Page() {
  const user = await requireUser()
  const rows = await db.userActivity.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' }, take: 50 }).catch(() => [])
  return <div><h1 className="text-3xl font-black">Activity</h1><p className="mt-2 text-slate-600">Recent account activity and exports.</p><Card className="mt-6"><CardHeader><CardTitle>Timeline</CardTitle></CardHeader><CardContent>{rows.length ? <div className="space-y-3">{rows.map(row => <div key={row.id} className="rounded-xl border p-4"><b>{row.action}</b><span className="ml-2 text-sm text-slate-500">{row.entity}</span><p className="mt-1 text-xs text-slate-500">{row.createdAt.toLocaleString()}</p></div>)}</div> : <p className="text-slate-500">No activity yet.</p>}</CardContent></Card></div>
}
