import { getLaunchEvidenceSummary } from '@/lib/qa/launch-evidence'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CopyButton } from '@/components/ui/copy-button'

const finalCommands = `npm install
npm run db:generate
npm run prisma:validate
npm run db:push
npm run db:seed
npm run quality:release
npm run release:typecheck
npm run build
npm run qa:production-pack
npm run link-checks:local
npm run test:e2e:install
E2E_BASE_URL=https://YOUR-VERCEL-DOMAIN npm run test:e2e
LIGHTHOUSE_BASE_URL=https://YOUR-VERCEL-DOMAIN npm run lighthouse:local
npm run release:deploy-check`

const qaRows = [
  ['Build', 'npm run build', 'No TypeScript, route, Prisma client, or Next build error'],
  ['Auth', 'Register, verify email, login, logout, admin login, forgot password', 'Session cookie, one-time links and role protection work'],
  ['AI tools', 'Complaint, UPI, scheme, documents, chat, OCR, scam radar', 'Fallback + API-key mode both safe and useful'],
  ['Storage', 'Upload and download document vault file', 'Signed URL opens only for owner and bucket is private'],
  ['Billing', 'Razorpay test checkout + webhook', 'Payment success upgrades plan only after server-side signature verification'],
  ['Email', 'Verification, password reset, reminder/test email', 'Inbox receives links and EmailLog records status'],
  ['SEO + links', 'Sitemap, robots, core public pages, official sources, npm run link-checks:local', 'No broken public core route and official links are reviewed or flagged'],
  ['Mobile/Desktop', 'Playwright + manual Chrome mobile view', 'Forms usable without horizontal scroll and CTAs are thumb-friendly'],
  ['Speed', 'Lighthouse on deployed URL', 'No critical performance/accessibility/SEO regression'],
  ['Security', 'Headers, CSRF, rate limit, env health', 'Unsafe cross-origin writes blocked and secrets are server-only'],
  ['Evidence pack', 'npm run qa:production-pack', 'Launch checklist, env readiness, official-link review and translation CSV are generated']
]

function statusClass(status: string) {
  if (status === 'PASS') return 'bg-emerald-50 text-emerald-800'
  if (status === 'READY_TO_TEST') return 'bg-blue-50 text-blue-800'
  if (status === 'MANUAL_REQUIRED') return 'bg-amber-50 text-amber-900'
  return 'bg-red-50 text-red-800'
}

export default function Page() {
  const summary = getLaunchEvidenceSummary()
  return (
    <div className="grid gap-6">
      <div>
        <p className="text-sm font-bold uppercase tracking-wider text-primary">Phase 40</p>
        <h1 className="text-3xl font-black">Final QA Command Center</h1>
        <p className="mt-2 text-slate-600">Use this page as the production launch gate: build, typecheck, payment (Razorpay), email (Resend), storage (Supabase), official data, translation, speed, evidence pack generation and Vercel QA.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardHeader><CardTitle>Total gates</CardTitle></CardHeader><CardContent><p className="text-3xl font-black">{summary.total}</p></CardContent></Card>
        <Card><CardHeader><CardTitle>Ready to test</CardTitle></CardHeader><CardContent><p className="text-3xl font-black text-blue-700">{summary.readyToTest}</p></CardContent></Card>
        <Card><CardHeader><CardTitle>Manual required</CardTitle></CardHeader><CardContent><p className="text-3xl font-black text-amber-700">{summary.manualRequired}</p></CardContent></Card>
        <Card><CardHeader><CardTitle>Blocked by env</CardTitle></CardHeader><CardContent><p className="text-3xl font-black text-red-700">{summary.blocked}</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>One-shot production QA commands</CardTitle></CardHeader>
        <CardContent>
          <pre className="overflow-auto rounded-2xl bg-slate-950 p-4 text-xs text-white">{finalCommands}</pre>
          <div className="mt-4"><CopyButton text={finalCommands} label="Copy production QA commands" /></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Manual launch gates</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-sm">
            <thead><tr className="border-b text-left"><th className="py-3 pr-4">Area</th><th className="py-3 pr-4">Test</th><th className="py-3 pr-4">Pass condition</th></tr></thead>
            <tbody>{qaRows.map(([area, test, pass]) => <tr key={area} className="border-b"><td className="py-3 pr-4 font-bold">{area}</td><td className="py-3 pr-4 text-slate-600">{test}</td><td className="py-3 pr-4 text-slate-600">{pass}</td></tr>)}</tbody>
          </table>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {summary.gates.map((gate) => (
          <Card key={gate.area}>
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <CardTitle className="text-base">{gate.area}</CardTitle>
                <Badge className={statusClass(gate.status)}>{gate.status}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-600">
              <p><b className="text-slate-900">Owner:</b> {gate.owner}</p>
              <p><b className="text-slate-900">Check:</b> {gate.commandOrCheck}</p>
              <p><b className="text-slate-900">Pass:</b> {gate.passCondition}</p>
              <p><b className="text-slate-900">Evidence:</b> {gate.evidenceToSave}</p>
              <p className="rounded-2xl bg-slate-50 p-3 text-xs">{gate.productionNotes}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle>Feature freeze rule</CardTitle></CardHeader>
        <CardContent><p className="text-sm leading-7 text-slate-600">No new modules after this point until production build, payment, email, storage, official data, translations, speed, evidence pack and Vercel QA are signed off. From now on, ship only bug fixes, verified data and UI polish.</p></CardContent>
      </Card>
    </div>
  )
}
