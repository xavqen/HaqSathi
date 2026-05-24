import { db } from '@/lib/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const dynamic = 'force-dynamic'
export default async function Page() {
  const users = await db.user.findMany({ orderBy: { createdAt: 'desc' }, take: 100, select: { id: true, name: true, email: true, role: true, plan: true, createdAt: true } })
  return <div><h1 className="text-3xl font-black">Users</h1><Card className="mt-6"><CardHeader><CardTitle>Latest users</CardTitle></CardHeader><CardContent className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b"><th className="py-2">Name</th><th>Email</th><th>Role</th><th>Plan</th><th>Joined</th></tr></thead><tbody>{users.map(u => <tr key={u.id} className="border-b"><td className="py-3">{u.name || '-'}</td><td>{u.email}</td><td>{u.role}</td><td>{u.plan}</td><td>{u.createdAt.toDateString()}</td></tr>)}</tbody></table></CardContent></Card></div>
}
