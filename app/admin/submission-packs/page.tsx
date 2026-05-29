import { requireAdmin } from '@/lib/auth/session'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Submission Pack Insights | Admin' }

export default async function Page() {
  await requireAdmin()
  const [total, recent, byIssue] = await Promise.all([
    db.submissionPack.count().catch(() => 0),
    db.submissionPack.findMany({ orderBy: { createdAt: 'desc' }, take: 12, include: { user: { select: { email: true, name: true } } } }).catch(() => []),
    db.submissionPack.groupBy({ by: ['issueType'], _count: { _all: true }, orderBy: { _count: { issueType: 'desc' } }, take: 10 }).catch(() => [])
  ])
  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] bg-white p-6 shadow-soft">
        <p className="text-sm font-bold uppercase tracking-wider text-emerald-700">Admin</p>
        <h1 className="mt-2 text-3xl font-black">Submission Pack Insights</h1>
        <p className="mt-2 text-sm text-slate-600">Track kaunse channels users ko sabse zyada chahiye: email, WhatsApp, support chat, escalation.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3"><div className="rounded-3xl border bg-white p-5"><p className="text-sm font-bold text-slate-500">Total packs</p><p className="mt-2 text-4xl font-black">{total}</p></div>{byIssue.slice(0,2).map((row) => <div key={row.issueType} className="rounded-3xl border bg-white p-5"><p className="text-sm font-bold text-slate-500">{row.issueType}</p><p className="mt-2 text-4xl font-black">{row._count._all}</p></div>)}</div>
      <div className="rounded-3xl border bg-white p-5"><h2 className="text-xl font-black">Recent packs</h2><div className="mt-4 overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b"><th className="py-2">User</th><th>Issue</th><th>Recipient</th><th>Language</th><th>Date</th></tr></thead><tbody>{recent.map((item) => <tr key={item.id} className="border-b"><td className="py-3">{item.user?.name || item.user?.email || 'Guest'}</td><td>{item.issueType}</td><td>{item.recipientType}</td><td>{item.language}</td><td>{item.createdAt.toLocaleDateString()}</td></tr>)}</tbody></table></div></div>
    </div>
  )
}
