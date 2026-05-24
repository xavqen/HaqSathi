import { requireAdmin } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { PromptTestRunForm } from '@/components/forms/prompt-test-run-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const dynamic = 'force-dynamic'
export default async function AdminPromptLabPage() {
  await requireAdmin()
  const runs = await db.promptTestRun.findMany({ orderBy: { createdAt: 'desc' }, take: 20 }).catch(() => [])
  return <div className="grid gap-6"><div><h1 className="text-3xl font-black tracking-tight">AI prompt lab</h1><p className="mt-2 text-slate-600">Safety, hallucination aur quality review ke liye prompt test logs.</p></div><div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]"><PromptTestRunForm /><div className="grid gap-4">{runs.map((run) => <Card key={run.id}><CardHeader><div className="flex items-center justify-between gap-3"><CardTitle>{run.name}</CardTitle><Badge>{run.score}/100</Badge></div></CardHeader><CardContent><p className="text-sm text-slate-600"><b>Tool:</b> {run.tool}</p>{run.issueNotes && <p className="mt-3 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">{run.issueNotes}</p>}</CardContent></Card>)}{runs.length === 0 && <p className="rounded-2xl border bg-white p-5 text-sm text-slate-600">No test runs yet.</p>}</div></div></div>
}
