import Link from 'next/link'
import { db } from '@/lib/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CopyButton } from '@/components/ui/copy-button'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Backups | Admin' }

const readinessCommand = 'npm run backups:readiness'
const cronEndpoint = '/api/cron/backup-readiness'
const exportEndpoint = '/api/admin/export/full?secret=ADMIN_BACKUP_SECRET'

export default async function Page() {
  const counts = await Promise.all([
    db.user.count().catch(() => 0),
    db.complaint.count().catch(() => 0),
    db.blogPost.count().catch(() => 0),
    db.supportTicket.count().catch(() => 0),
    db.documentVaultItem.count().catch(() => 0),
    db.userActivity.count().catch(() => 0)
  ])

  const cards = [
    ['Users', counts[0]],
    ['Complaints', counts[1]],
    ['Blog posts', counts[2]],
    ['Tickets', counts[3]],
    ['Vault items', counts[4]],
    ['Audit events', counts[5]]
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Badge>Production safety</Badge>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950">Backups</h1>
          <p className="mt-2 max-w-3xl text-slate-600">Database, storage and admin JSON backup readiness monitor karo. Real production launch se pehle restore drill evidence save karna mandatory hai.</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Link href={exportEndpoint} className="inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground">Download admin backup</Link>
          <Link href="/admin/backup-restore" className="inline-flex min-h-11 items-center justify-center rounded-xl border px-5 py-3 text-sm font-semibold">Restore runbook</Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        {cards.map(([label, value]) => (
          <Card key={label as string}>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-600">{label}</CardTitle></CardHeader>
            <CardContent><div className="text-3xl font-black">{value}</div></CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Backup readiness workflow</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-slate-600">
            <p>Local evidence command run karke JSON/CSV report generate karo. Ye code/config readiness check karta hai; real restore test alag se karna hoga.</p>
            <pre className="overflow-x-auto rounded-2xl bg-slate-950 p-4 text-white">{readinessCommand}</pre>
            <CopyButton text={readinessCommand} label="Copy command" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cron readiness endpoint</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-slate-600">
            <p>Vercel Cron ya uptime monitor se protected readiness endpoint hit karo. Production me <code>Authorization: Bearer CRON_SECRET</code> header use karo.</p>
            <pre className="overflow-x-auto rounded-2xl bg-slate-950 p-4 text-white">GET {cronEndpoint}</pre>
            <CopyButton text={cronEndpoint} label="Copy endpoint" />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Launch backup gates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {[
              ['DB backup', 'Supabase managed backup enabled and export verified.'],
              ['Storage backup', 'Private bucket files can be restored and accessed by owner only.'],
              ['Admin JSON export', 'Secondary app-level export downloads with secret protection.'],
              ['Restore drill', 'Monthly staging restore evidence saved under artifacts/backup-readiness.']
            ].map(([title, body]) => (
              <div key={title} className="rounded-2xl border bg-slate-50 p-4">
                <p className="font-black text-slate-950">{title}</p>
                <p className="mt-2 text-sm text-slate-600">{body}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
