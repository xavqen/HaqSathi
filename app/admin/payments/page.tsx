import { db } from '@/lib/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const dynamic = 'force-dynamic'
export default async function Page() {
  const payments = await db.paymentOrder.findMany({ orderBy: { createdAt: 'desc' }, take: 100, include: { user: { select: { email: true } } } })
  return <div><h1 className="text-3xl font-black">Payments</h1><p className="mt-2 text-slate-600">Razorpay-ready orders and webhook status.</p><Card className="mt-6"><CardHeader><CardTitle>Latest payment orders</CardTitle></CardHeader><CardContent className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b"><th className="py-2">User</th><th>Plan</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead><tbody>{payments.map(p => <tr key={p.id} className="border-b"><td className="py-3">{p.user?.email || 'guest'}</td><td>{p.plan}</td><td>₹{p.amount / 100}</td><td>{p.status}</td><td>{p.createdAt.toDateString()}</td></tr>)}</tbody></table>{payments.length === 0 && <p className="text-slate-500">No payment orders yet.</p>}</CardContent></Card></div>
}
