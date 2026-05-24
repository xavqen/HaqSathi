import { requireAdmin } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Notifications | Admin | HaqSathi AI' }

export default async function AdminNotificationsPage() {
  await requireAdmin()
  const [queued, sent, failed, notifications] = await Promise.all([
    db.reminderNotification.count({ where: { status: 'QUEUED' } }),
    db.reminderNotification.count({ where: { status: 'SENT' } }),
    db.reminderNotification.count({ where: { status: 'FAILED' } }),
    db.reminderNotification.findMany({ include: { user: { select: { email: true, name: true } } }, orderBy: { createdAt: 'desc' }, take: 50 })
  ])

  return <div className="space-y-6">
    <div>
      <h1 className="text-3xl font-bold">Notification center</h1>
      <p className="mt-2 text-slate-600">Reminder cron aur email queue monitor karo.</p>
    </div>
    <div className="grid gap-4 md:grid-cols-3">
      <Card><CardHeader><CardTitle>Queued</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{queued}</p></CardContent></Card>
      <Card><CardHeader><CardTitle>Sent</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{sent}</p></CardContent></Card>
      <Card><CardHeader><CardTitle>Failed</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{failed}</p></CardContent></Card>
    </div>
    <Card><CardHeader><CardTitle>Recent reminder notifications</CardTitle></CardHeader><CardContent className="space-y-3">
      {notifications.length === 0 && <p className="text-sm text-slate-600">No notifications yet. Cron run ke baad items dikhenge.</p>}
      {notifications.map((n) => <div key={n.id} className="rounded-2xl border p-4 text-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"><b>{n.user?.name || n.user?.email || 'Guest'}</b><Badge>{n.status}</Badge></div>
        <p className="mt-1 text-slate-600">{n.channel} · {n.createdAt.toDateString()} {n.sentAt ? `· sent ${n.sentAt.toDateString()}` : ''}</p>
        <pre className="mt-2 overflow-auto rounded-xl bg-slate-50 p-3 text-xs">{JSON.stringify(n.payload, null, 2)}</pre>
      </div>)}
    </CardContent></Card>
  </div>
}
