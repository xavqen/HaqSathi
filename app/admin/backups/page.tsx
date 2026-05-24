import Link from 'next/link'
import { db } from '@/lib/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const dynamic = 'force-dynamic'
export default async function Page() {
  const counts = await Promise.all([
    db.user.count().catch(() => 0),
    db.complaint.count().catch(() => 0),
    db.blogPost.count().catch(() => 0),
    db.supportTicket.count().catch(() => 0)
  ])
  return <div><h1 className="text-3xl font-black">Backups</h1><p className="mt-2 text-slate-600">Admin JSON backup endpoint for migration/safe copy.</p><div className="mt-6 grid gap-5 md:grid-cols-4">{['Users', 'Complaints', 'Blog posts', 'Tickets'].map((label, i) => <Card key={label}><CardHeader><CardTitle>{label}</CardTitle></CardHeader><CardContent><div className="text-3xl font-black">{counts[i]}</div></CardContent></Card>)}</div><Card className="mt-6"><CardHeader><CardTitle>Full backup</CardTitle></CardHeader><CardContent><p className="text-sm text-slate-600">Production me URL ke saath <code>?secret=ADMIN_BACKUP_SECRET</code> use karo. Secret set hoga to bina secret backup block hoga.</p><Link href="/api/admin/export/full" className="mt-5 inline-flex rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground">Download admin backup</Link></CardContent></Card></div>
}
