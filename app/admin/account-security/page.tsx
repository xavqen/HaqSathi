import { AlertTriangle, Fingerprint, KeyRound, ShieldCheck, Smartphone, UserCheck } from 'lucide-react'
import { getAccountSecurityReadinessReport } from '@/lib/security/account-security'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CopyButton } from '@/components/ui/copy-button'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Account Security | HaqSathi AI' }

const localCommand = 'npm run account-security:readiness'
const apiPath = '/api/admin/account-security-readiness'

function StatusBadge({ status }: { status: string }) {
  const className = status === 'PASS' || status === 'READY_TO_TEST'
    ? 'bg-emerald-50 text-emerald-700'
    : status === 'BLOCKED'
      ? 'bg-red-50 text-red-700'
      : 'bg-amber-50 text-amber-700'
  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ${className}`}>{status}</span>
}

function FactorIcon({ type }: { type: string }) {
  const icons = {
    passkey: Fingerprint,
    totp: Smartphone,
    backup_code: KeyRound,
    email: UserCheck,
    session: ShieldCheck,
    risk: AlertTriangle
  } as const
  const Icon = icons[type as keyof typeof icons] || ShieldCheck
  return <Icon className="h-5 w-5 text-emerald-700" />
}

export default function AdminAccountSecurityPage() {
  const report = getAccountSecurityReadinessReport()
  const summaryCards = [
    ['Factors', report.summary.totalFactors],
    ['Ready', report.summary.ready],
    ['Manual QA', report.summary.manualRequired],
    ['Blocked', report.summary.blocked]
  ] as const

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Badge>Phase 49</Badge>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950">Account security readiness</h1>
          <p className="mt-2 max-w-3xl text-slate-600">Prepare passkeys, authenticator-app 2FA, backup codes, security alerts and session review without changing current login business logic.</p>
        </div>
        <div className="rounded-2xl border bg-white px-4 py-3 text-sm shadow-soft">
          <p className="font-black text-slate-950">Status: {report.summary.launchStatus}</p>
          <p className="text-slate-600">Mode: {report.mode} · Enforcement: {report.enforcement}</p>
        </div>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map(([label, value]) => (
          <Card key={label}>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-600">{label}</CardTitle></CardHeader>
            <CardContent><div className="text-3xl font-black text-slate-950">{value}</div></CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Security factors</CardTitle>
            <CardDescription>Launch-safe view of what is ready, blocked or needs manual QA.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {report.factors.map((factor) => (
              <div key={factor.id} className="rounded-2xl border bg-slate-50 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex min-w-0 gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm"><FactorIcon type={factor.type} /></span>
                    <div className="min-w-0">
                      <p className="font-black text-slate-950">{factor.label}</p>
                      <p className="mt-1 text-sm text-slate-600">{factor.userValue}</p>
                    </div>
                  </div>
                  <StatusBadge status={factor.status} />
                </div>
                <div className="mt-3 rounded-xl bg-white p-3 text-sm text-slate-600">
                  <p><b className="text-slate-950">Admin:</b> {factor.adminValue}</p>
                  <p className="mt-1"><b className="text-slate-950">Launch note:</b> {factor.launchNote}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Evidence commands</CardTitle>
            <CardDescription>Use this before enabling strict login security in production.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-slate-600">
            <div>
              <p className="mb-2 font-black text-slate-950">Local evidence</p>
              <pre className="overflow-x-auto rounded-2xl bg-slate-950 p-4 text-white">{localCommand}</pre>
              <div className="mt-3"><CopyButton text={localCommand} label="Copy command" /></div>
            </div>
            <div>
              <p className="mb-2 font-black text-slate-950">Admin API</p>
              <pre className="overflow-x-auto rounded-2xl bg-slate-950 p-4 text-white">{apiPath}</pre>
              <div className="mt-3"><CopyButton text={apiPath} label="Copy API path" /></div>
            </div>
            <div className="rounded-2xl border bg-slate-50 p-4">
              <p className="font-black text-slate-950">Safe rollout order</p>
              <ol className="mt-2 list-decimal space-y-1 pl-5">
                <li>Keep current login flow unchanged.</li>
                <li>Test admin-only 2FA first.</li>
                <li>Add backup codes before forcing 2FA.</li>
                <li>Enable passkeys only on final HTTPS domain.</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Rollout checklist</CardTitle>
            <CardDescription>Operational steps before making security stricter.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {report.rollout.map((item) => (
              <div key={item.step} className="rounded-2xl border p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="font-black text-slate-950">{item.step}</p>
                    <p className="mt-1 text-sm text-slate-600">Owner: {item.owner}</p>
                  </div>
                  <StatusBadge status={item.status} />
                </div>
                <p className="mt-3 text-sm text-slate-600">{item.action}</p>
                <p className="mt-2 text-xs font-semibold text-slate-500">Evidence: {item.evidence}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Minimum launch evidence</CardTitle>
            <CardDescription>Save these proofs before enabling strict 2FA/passkeys.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="grid gap-3 text-sm text-slate-600">
              {report.minimumEvidence.map((item) => (
                <li key={item} className="flex gap-3 rounded-2xl border bg-slate-50 p-3">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
