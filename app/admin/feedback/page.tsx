import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'
export default async function Page() {
  const items = await db.feedback.findMany({ include: { user: { select: { email: true } } }, orderBy: { createdAt: 'desc' }, take: 100 }).catch(() => [])
  const avg = items.length ? (items.reduce((sum, item) => sum + item.rating, 0) / items.length).toFixed(1) : '0'
  return <div><h1 className="text-3xl font-black">Feedback</h1><p className="mt-2 text-slate-600">Average rating: {avg}/5 · Latest {items.length} items</p><div className="mt-6 space-y-3">{items.length === 0 ? <div className="rounded-2xl border bg-white p-6 text-slate-500">No feedback yet.</div> : items.map((item) => <div key={item.id} className="rounded-2xl border bg-white p-5"><div className="flex flex-wrap justify-between gap-3"><b>{item.entity} · {item.rating}/5</b><span className="text-sm text-slate-500">{item.user?.email || 'Guest'} · {item.createdAt.toDateString()}</span></div>{item.comment ? <p className="mt-2 text-slate-700">{item.comment}</p> : null}</div>)}</div></div>
}
