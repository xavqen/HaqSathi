import { db } from '@/lib/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const dynamic = 'force-dynamic'
export default async function Page() {
  const reviews = await db.aiOutputReview.findMany({ include: { user: { select: { email: true, name: true } } }, orderBy: { createdAt: 'desc' }, take: 100 })
  const avg = reviews.length ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : '0'
  return <div><h1 className="text-3xl font-black">AI Reviews</h1><p className="mt-2 text-slate-600">Users ke AI-output feedback se hallucination, unsafe advice aur missing steps detect karo.</p><div className="mt-6 grid gap-4 md:grid-cols-3"><Card><CardHeader><CardTitle>Total Reviews</CardTitle></CardHeader><CardContent className="text-3xl font-black">{reviews.length}</CardContent></Card><Card><CardHeader><CardTitle>Average Rating</CardTitle></CardHeader><CardContent className="text-3xl font-black">{avg}/5</CardContent></Card><Card><CardHeader><CardTitle>Low Rating</CardTitle></CardHeader><CardContent className="text-3xl font-black">{reviews.filter((r) => r.rating <= 2).length}</CardContent></Card></div><Card className="mt-6"><CardHeader><CardTitle>Latest feedback</CardTitle></CardHeader><CardContent className="space-y-3">{reviews.length ? reviews.map((r) => <div key={r.id} className="rounded-2xl border p-4"><div className="flex flex-wrap gap-2"><Badge>{r.tool}</Badge><Badge>{r.issueType}</Badge><Badge>{r.rating}/5</Badge></div><p className="mt-2 text-sm text-slate-600">{r.user?.email || 'Guest'} · {r.createdAt.toLocaleString('en-IN')}</p>{r.comment && <p className="mt-2 text-sm">{r.comment}</p>}</div>) : <p className="text-slate-500">No AI reviews yet.</p>}</CardContent></Card></div>
}
