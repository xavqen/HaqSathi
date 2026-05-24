import { db } from '@/lib/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EmailTestButton } from './test-button'

export const dynamic = 'force-dynamic'
export default async function Page() {
  const logs = await db.emailLog.findMany({ orderBy: { createdAt: 'desc' }, take: 100 }).catch(() => [])
  return <div><div className="flex flex-wrap items-center justify-between gap-4"><div><h1 className="text-3xl font-black">Emails</h1><p className="mt-2 text-slate-600">Resend-ready transactional email logs.</p></div><EmailTestButton /></div><Card className="mt-6"><CardHeader><CardTitle>Email logs</CardTitle></CardHeader><CardContent>{logs.length ? <div className="space-y-3">{logs.map(log => <div key={log.id} className="rounded-xl border p-4"><div className="flex flex-wrap justify-between gap-3"><b>{log.subject}</b><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold">{log.status}</span></div><p className="mt-1 text-sm text-slate-600">To: {log.toEmail} · Template: {log.template}</p>{log.error ? <p className="mt-2 text-sm text-red-600">{log.error}</p> : null}</div>)}</div> : <p className="text-slate-500">No email logs yet.</p>}</CardContent></Card></div>
}
