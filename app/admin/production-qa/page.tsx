import { db } from '@/lib/db'
import { getProductionQaSummary } from '@/lib/qa/production-readiness'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CopyButton } from '@/components/ui/copy-button'

export const dynamic = 'force-dynamic'

function statusClass(status: string) {
  if (status === 'PASS' || status === 'READY_TO_RUN') return 'bg-emerald-50 text-emerald-800'
  if (status === 'NEEDS_EVIDENCE') return 'bg-amber-50 text-amber-900'
  if (status === 'BLOCKED') return 'bg-red-50 text-red-800'
  return 'bg-slate-100 text-slate-700'
}

const packCommand = `npm run quality:release
npm run qa:production-pack
npm run release:deploy-check`

export default async function Page() {
  const runs = await db.productionQaRun.findMany({ orderBy: { createdAt: 'desc' }, take: 50 }).catch(() => [])
  const summary = getProductionQaSummary()
  return (
    <div className="grid gap-6">
      <div>
        <p className="text-sm font-bold uppercase tracking-wider text-primary">Phase 40</p>
        <h1 className="text-3xl font-black">Production QA Evidence Center</h1>
        <p className="mt-2 max-w-3xl text-slate-600">Track the real launch gates that cannot be fully proven inside code: Vercel runtime, payment, email, storage, official links, translations, Playwright, Lighthouse and security abuse checks.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-5">
        <Card><CardHeader><CardTitle>Total gates</CardTitle></CardHeader><CardContent><p className="text-3xl font-black">{summary.total}</p></CardContent></Card>
        <Card><CardHeader><CardTitle>P0 gates</CardTitle></CardHeader><CardContent><p className="text-3xl font-black text-slate-900">{summary.p0}</p></CardContent></Card>
        <Card><CardHeader><CardTitle>Ready</CardTitle></CardHeader><CardContent><p className="text-3xl font-black text-emerald-700">{summary.readyToRun}</p></CardContent></Card>
        <Card><CardHeader><CardTitle>Needs evidence</CardTitle></CardHeader><CardContent><p className="text-3xl font-black text-amber-700">{summary.needsEvidence}</p></CardContent></Card>
        <Card><CardHeader><CardTitle>Blocked</CardTitle></CardHeader><CardContent><p className="text-3xl font-black text-red-700">{summary.blocked}</p></CardContent></Card>
      </div>

      <Card className={summary.canLaunch ? 'border-emerald-200 bg-emerald-50/60' : 'border-red-200 bg-red-50/60'}>
        <CardHeader><CardTitle>{summary.canLaunch ? 'Code-side P0 gates are not env-blocked' : 'Launch blocked by missing P0 env/evidence'}</CardTitle></CardHeader>
        <CardContent><p className="text-sm leading-7 text-slate-700">This is not a final launch approval. It means the checklist is ready to run. Real launch still needs saved evidence for payment, email, storage, Vercel, security, speed and mobile tests.</p></CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Generate production evidence pack</CardTitle></CardHeader>
        <CardContent>
          <pre className="overflow-auto rounded-2xl bg-slate-950 p-4 text-xs text-white">{packCommand}</pre>
          <div className="mt-4"><CopyButton text={packCommand} label="Copy QA pack commands" /></div>
          <p className="mt-3 text-sm text-slate-600">Output goes to <code>artifacts/production-qa</code>: launch checklist, env readiness, official-link review CSV and translation-review CSV.</p>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {summary.items.map((item) => (
          <Card key={item.id}>
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <CardTitle className="text-base">{item.area}</CardTitle>
                <div className="flex gap-2"><Badge>{item.priority}</Badge><Badge className={statusClass(item.status)}>{item.status}</Badge></div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-600">
              <p><b className="text-slate-900">Owner:</b> {item.owner}</p>
              <p><b className="text-slate-900">Action:</b> {item.commandOrAction}</p>
              <p><b className="text-slate-900">Pass:</b> {item.passCondition}</p>
              <p><b className="text-slate-900">Evidence:</b> {item.evidence}</p>
              <p className="rounded-2xl bg-slate-50 p-3 text-xs"><b>Fail action:</b> {item.failureAction}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle>Priority translation review matrix</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead><tr className="border-b text-left"><th className="py-3 pr-4">Page</th><th className="py-3 pr-4">Priority</th><th className="py-3 pr-4">Locales</th><th className="py-3 pr-4">Reason</th></tr></thead>
            <tbody>{summary.priorityTranslationPages.map((row) => <tr key={row.page} className="border-b"><td className="py-3 pr-4 font-bold">{row.page}</td><td className="py-3 pr-4">{row.priority}</td><td className="py-3 pr-4 text-slate-600">{row.locales.join(', ')}</td><td className="py-3 pr-4 text-slate-600">{row.reason}</td></tr>)}</tbody>
          </table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Saved production QA records</CardTitle></CardHeader>
        <CardContent>
          {runs.length ? <div className="grid gap-4">{runs.map((r) => <div key={r.id} className="rounded-2xl border bg-white p-4"><div className="flex flex-wrap items-center justify-between gap-2"><b>{r.area}</b><Badge>{r.status}</Badge></div><p className="mt-1 text-sm text-slate-600">{r.device} · {r.browser} · {r.testedBy || 'Unassigned'}</p><pre className="mt-3 overflow-auto rounded-xl bg-slate-50 p-3 text-xs">{JSON.stringify({ checklist: r.checklist, issues: r.issues }, null, 2)}</pre></div>)}</div> : <p className="text-sm text-slate-600">No saved DB QA records yet. Generate the production evidence pack and run real deployed QA first.</p>}
        </CardContent>
      </Card>
    </div>
  )
}
