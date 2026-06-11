import { FileCheck2, FileWarning, LockKeyhole, ScanLine, ShieldAlert, ShieldCheck } from 'lucide-react'
import { getDocumentVaultSafetyReadinessReport } from '@/lib/security/document-vault-safety'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CopyButton } from '@/components/ui/copy-button'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Document Vault Safety | HaqSathi AI' }

const localCommand = 'npm run vault-safety:readiness'
const apiPath = '/api/admin/document-vault-safety-readiness'

function StatusBadge({ status }: { status: string }) {
  const className = status === 'PASS' || status === 'READY_TO_TEST'
    ? 'bg-emerald-50 text-emerald-700'
    : status === 'BLOCKED'
      ? 'bg-red-50 text-red-700'
      : 'bg-amber-50 text-amber-700'
  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ${className}`}>{status}</span>
}

function ControlIcon({ id }: { id: string }) {
  const icons = {
    'basic-file-safety-scan': ScanLine,
    'private-storage': LockKeyhole,
    'external-malware-scanner': ShieldAlert,
    'quarantine-workflow': FileWarning,
    'encryption-readiness': ShieldCheck,
    'vault-audit-log': FileCheck2
  } as const
  const Icon = icons[id as keyof typeof icons] || ShieldCheck
  return <Icon className="h-5 w-5 text-emerald-700" />
}

export default function AdminDocumentVaultSafetyPage() {
  const report = getDocumentVaultSafetyReadinessReport()
  const summaryCards = [
    ['Controls', report.summary.totalControls],
    ['Ready', report.summary.ready],
    ['Manual QA', report.summary.manualRequired],
    ['Blocked', report.summary.blocked]
  ] as const

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Badge>Phase 50</Badge>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950">Document vault safety</h1>
          <p className="mt-2 max-w-3xl text-slate-600">Protect user uploads with file type validation, magic-byte checks, risky extension blocking, private storage evidence and production scanner readiness.</p>
        </div>
        <div className="rounded-2xl border bg-white px-4 py-3 text-sm shadow-soft">
          <p className="font-black text-slate-950">Status: {report.summary.launchStatus}</p>
          <p className="text-slate-600">Mode: {report.mode} · Rules: {report.uploadRules.allowedExtensions.join(', ')}</p>
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
            <CardTitle>Safety controls</CardTitle>
            <CardDescription>Readiness status for upload protection and storage privacy.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {report.controls.map((control) => (
              <div key={control.id} className="rounded-2xl border bg-slate-50 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex min-w-0 gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm"><ControlIcon id={control.id} /></span>
                    <div className="min-w-0">
                      <p className="font-black text-slate-950">{control.label}</p>
                      <p className="mt-1 text-sm text-slate-600">{control.userValue}</p>
                    </div>
                  </div>
                  <StatusBadge status={control.status} />
                </div>
                <div className="mt-3 rounded-xl bg-white p-3 text-sm text-slate-600">
                  <p><b className="text-slate-950">Admin:</b> {control.adminValue}</p>
                  <p className="mt-1"><b className="text-slate-950">Launch note:</b> {control.launchNote}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Evidence commands</CardTitle>
            <CardDescription>Use these before allowing public document uploads at scale.</CardDescription>
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
              <p className="font-black text-slate-950">Current upload rules</p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>Max file size: {report.uploadRules.maxFileSizeMB}MB</li>
                <li>Allowed: {report.uploadRules.allowedExtensions.join(', ')}</li>
                <li>Blocked risky extensions: {report.uploadRules.riskyExtensions.slice(0, 10).join(', ')}</li>
                <li>Downloads should use private signed URLs only.</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Minimum launch evidence</CardTitle>
            <CardDescription>Proofs to save before launching the vault publicly.</CardDescription>
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

        <Card>
          <CardHeader>
            <CardTitle>Safe rollout order</CardTitle>
            <CardDescription>Keep the current vault simple but safer.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-600">
            <div className="rounded-2xl border p-4">
              <p className="font-black text-slate-950">1. Basic blocking now</p>
              <p className="mt-1">Reject unsafe extensions, MIME mismatch, unknown signatures and active PDF/script markers during upload.</p>
            </div>
            <div className="rounded-2xl border p-4">
              <p className="font-black text-slate-950">2. Private bucket QA</p>
              <p className="mt-1">Verify the file cannot be opened directly and works only through a short-lived signed URL.</p>
            </div>
            <div className="rounded-2xl border p-4">
              <p className="font-black text-slate-950">3. External scanner later</p>
              <p className="mt-1">Connect ClamAV/cloud scanner before high-volume document uploads or sensitive enterprise usage.</p>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
