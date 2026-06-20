import Link from 'next/link'
import { getSecurityHardeningChecks } from '@/lib/launch/security-hardening'
import { getMvpEnterpriseReadiness } from '@/lib/launch/mvp-enterprise-readiness'
import { getFinalQaMatrix } from '@/lib/launch/final-qa-matrix'
import { getProductionOpsChecklist } from '@/lib/launch/production-ops'
import { getIncidentRollbackChecklist } from '@/lib/launch/incident-rollback'
import { getPostLaunchSupportChecklist } from '@/lib/launch/post-launch-support'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const metadata = { title: 'Launch Readiness', description: 'Production launch checklist for HaqSathi AI.' }

export default function Page() {
  const security = getSecurityHardeningChecks()
  const mvpReadiness = getMvpEnterpriseReadiness()
  const finalQa = getFinalQaMatrix()
  const productionOps = getProductionOpsChecklist()
  const incidentRollback = getIncidentRollbackChecklist()
  const postLaunchSupport = getPostLaunchSupportChecklist()
  return (
    <main className="bg-slate-50">
      <section className="mx-auto max-w-7xl px-4 py-12">
        <p className="text-sm font-bold uppercase tracking-wider text-primary">Phase 17</p>
        <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-950">Final launch readiness</h1>
        <p className="mt-3 max-w-2xl text-slate-600">After feature build, pass these final checks before production launch.</p>
        <div className="mt-6 rounded-3xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
          <p className="text-sm font-black uppercase tracking-wider text-amber-800">Final blocker rule</p>
          <h2 className="mt-2 text-2xl font-black text-amber-950">Do not launch until the evidence gate says GO</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-amber-900">Run live route QA, payment/storage checks, Lighthouse, Playwright and manual approval evidence first. Then run <code className="rounded bg-amber-100 px-2 py-1 font-bold">npm run launch:evidence-gate</code> and <code className="rounded bg-amber-100 px-2 py-1 font-bold">npm run launch:artifact-manifest</code>. If the evidence gate says BLOCKED/MANUAL_REQUIRED or the artifact manifest finds secret leaks, keep the site in soft launch.</p>
        </div>
        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {['Build pass', 'DB + Storage ready', 'Payments tested', 'Email tested'].map((item) => <Card key={item}><CardHeader><CardTitle>{item}</CardTitle></CardHeader><CardContent><p className="text-sm text-slate-600">Verify the matching audit page in the admin panel.</p></CardContent></Card>)}
        </div>
        <div className="mt-8 rounded-3xl border bg-white p-6 shadow-soft">
          <h2 className="text-2xl font-black">MVP enterprise readiness pillars</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">This shows what is implemented in code and what still needs live production proof before final launch.</p>
          <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {mvpReadiness.map((item) => (
              <Card key={item.title}>
                <CardHeader>
                  <p className="text-xs font-black uppercase tracking-wider text-emerald-700">{item.status}</p>
                  <CardTitle>{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-6 text-slate-600">{item.summary}</p>
                  <ul className="mt-3 list-disc space-y-1 pl-5 text-xs leading-5 text-slate-500">
                    {item.evidence.map((line) => <li key={line}>{line}</li>)}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="mt-8 rounded-3xl border bg-white p-6 shadow-soft">
          <h2 className="text-2xl font-black">Production proof checklist</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">Run these after deploying to Vercel. They turn your launch into evidence: live route QA, payment/storage readiness, Lighthouse, Playwright, artifact hashes, secret-leak scanning and manual proof.</p>
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            {finalQa.map((item) => (
              <Card key={item.id}>
                <CardHeader>
                  <p className="text-xs font-black uppercase tracking-wider text-primary">{item.status.replaceAll('_', ' ')}</p>
                  <CardTitle>{item.pillar}</CardTitle>
                </CardHeader>
                <CardContent>
                  <code className="block overflow-x-auto rounded-2xl bg-slate-950 p-3 text-xs text-emerald-100">{item.command}</code>
                  <p className="mt-3 text-sm leading-6 text-slate-600"><strong>Evidence:</strong> {item.evidence}</p>
                  <p className="mt-2 text-xs leading-5 text-slate-500"><strong>Risk if skipped:</strong> {item.failureRisk}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="mt-8 rounded-3xl border bg-white p-6 shadow-soft">
          <h2 className="text-2xl font-black">Production operations snapshot</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">After every Vercel production deploy, run the ops snapshot so health, readiness, latency, cache headers and blocker evidence are saved with the launch proof.</p>
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            {productionOps.map((item) => (
              <Card key={item.id}>
                <CardHeader>
                  <p className="text-xs font-black uppercase tracking-wider text-primary">{item.owner}</p>
                  <CardTitle>{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <code className="block overflow-x-auto rounded-2xl bg-slate-950 p-3 text-xs text-emerald-100">{item.command}</code>
                  <p className="mt-3 text-sm leading-6 text-slate-600"><strong>Evidence:</strong> {item.evidence}</p>
                  <p className="mt-2 text-xs leading-5 text-slate-500"><strong>Launch rule:</strong> {item.launchRule}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="mt-8 rounded-3xl border bg-white p-6 shadow-soft">
          <h2 className="text-2xl font-black">Incident rollback runbook</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">Before public launch, prove that a bad deploy can be handled: last known-good deployment, rollback owner, incident owner, backup confirmation and maintenance communication must be ready.</p>
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            {incidentRollback.map((item) => (
              <Card key={item.id}>
                <CardHeader>
                  <p className="text-xs font-black uppercase tracking-wider text-rose-700">{item.severity.replaceAll('-', ' ')}</p>
                  <CardTitle>{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs font-black uppercase tracking-wider text-slate-500">Owner: {item.owner}</p>
                  <code className="mt-3 block overflow-x-auto rounded-2xl bg-slate-950 p-3 text-xs text-emerald-100">{item.command}</code>
                  <p className="mt-3 text-sm leading-6 text-slate-600"><strong>Evidence:</strong> {item.evidence}</p>
                  <p className="mt-2 text-xs leading-5 text-slate-500"><strong>Action:</strong> {item.action}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="mt-8 rounded-3xl border bg-white p-6 shadow-soft">
          <h2 className="text-2xl font-black">Post-launch support gate</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">Before public traffic, prove that users can reach support, urgent fraud/payment/login/document issues have an owner, and support replies stay privacy-safe.</p>
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            {postLaunchSupport.map((item) => (
              <Card key={item.id}>
                <CardHeader>
                  <p className="text-xs font-black uppercase tracking-wider text-primary">{item.owner}</p>
                  <CardTitle>{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <code className="block overflow-x-auto rounded-2xl bg-slate-950 p-3 text-xs text-emerald-100">{item.command}</code>
                  <p className="mt-3 text-sm leading-6 text-slate-600"><strong>Evidence:</strong> {item.evidence}</p>
                  <p className="mt-2 text-xs leading-5 text-slate-500"><strong>Launch rule:</strong> {item.launchRule}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>


        <div className="mt-8 rounded-3xl border bg-white p-6 shadow-soft">
          <h2 className="text-2xl font-black">Security baseline</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {security.map((item) => <div key={`${item.area}-${item.item}`} className="rounded-2xl bg-slate-50 p-4"><p className="font-bold">{item.item}</p><p className="mt-1 text-sm text-slate-600">{item.note}</p></div>)}
          </div>
          <div className="mt-6 flex flex-wrap gap-3"><Link href="/admin/launch" className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground">Open admin launch checks</Link><Link href="/deploy-guide" className="rounded-xl border px-5 py-3 text-sm font-semibold">Deployment guide</Link></div>
        </div>
      </section>
    </main>
  )
}
