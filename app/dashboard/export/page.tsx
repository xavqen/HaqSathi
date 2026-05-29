import Link from 'next/link'
import { requireUser } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const dynamic = 'force-dynamic'
export default async function Page() {
  const user = await requireUser()
  const exports = await db.dataExport.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' }, take: 20 }).catch(() => [])
  return <div><h1 className="text-3xl font-black">Data Export</h1><p className="mt-2 text-slate-600">Download a JSON backup of your complaints, reminders, checklists and profile.</p><div className="mt-6 grid gap-5 md:grid-cols-2"><Card><CardHeader><CardTitle>Full JSON export</CardTitle></CardHeader><CardContent><p className="text-sm text-slate-600">This file is developer-friendly and includes your saved data. Passwords and session secrets are never exported.</p><Link href="/api/dashboard/export/data" className="mt-5 inline-flex rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground">Download JSON Backup</Link></CardContent></Card><Card><CardHeader><CardTitle>Complaint CSV</CardTitle></CardHeader><CardContent><p className="text-sm text-slate-600">Export complaints as CSV for spreadsheets.</p><Link href="/api/dashboard/export/complaints" className="mt-5 inline-flex rounded-xl border px-5 py-3 text-sm font-semibold">Download CSV</Link></CardContent></Card></div><Card className="mt-6"><CardHeader><CardTitle>Recent exports</CardTitle></CardHeader><CardContent>{exports.length ? <div className="space-y-2">{exports.map(row => <div key={row.id} className="flex justify-between rounded-xl border p-3 text-sm"><span>{row.fileName}</span><span className="text-slate-500">{row.createdAt.toLocaleDateString()}</span></div>)}</div> : <p className="text-slate-500">No exports yet.</p>}</CardContent></Card></div>
}
