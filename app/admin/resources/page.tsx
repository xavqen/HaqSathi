import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'
export default async function Page() {
  const resources = await db.officialResource.findMany({ orderBy: [{ type: 'asc' }, { title: 'asc' }] }).catch(() => [])
  return <div><h1 className="text-3xl font-black">Official Resources</h1><p className="mt-2 text-slate-600">Official link directory. Phase 6 me read-only admin view; links seed file/DB se manage ho sakte hain.</p><div className="mt-6 overflow-hidden rounded-3xl border bg-white shadow-soft"><table className="w-full text-left text-sm"><thead className="bg-slate-50"><tr><th className="p-4">Title</th><th>Type</th><th>State</th><th>Verified</th><th>URL</th></tr></thead><tbody>{resources.map((r) => <tr key={r.id} className="border-t"><td className="p-4 font-semibold">{r.title}</td><td>{r.type}</td><td>{r.state || 'India'}</td><td>{r.isVerified ? 'Yes' : 'No'}</td><td>{r.url ? <a href={r.url} className="text-primary" target="_blank">Open</a> : 'Pending'}</td></tr>)}</tbody></table></div></div>
}
