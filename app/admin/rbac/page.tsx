import { ShieldCheck, Users, KeyRound, Route, AlertTriangle } from 'lucide-react'
import { getRbacReadinessReport, getPermissionStatus } from '@/lib/security/admin-rbac'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CopyButton } from '@/components/ui/copy-button'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Admin RBAC' }

const localCommand = 'npm run rbac:readiness'

function StatusBadge({ status }: { status: string }) {
  const className = status === 'PASS'
    ? 'bg-emerald-50 text-emerald-700'
    : status === 'allowed'
      ? 'bg-emerald-50 text-emerald-700'
      : status === 'blocked' || status === 'ACTION_NEEDED'
        ? 'bg-red-50 text-red-700'
        : 'bg-amber-50 text-amber-700'
  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ${className}`}>{status}</span>
}

export default function AdminRbacPage() {
  const report = getRbacReadinessReport()
  const stats = [
    ['Roles', report.roles.length, Users],
    ['Permissions', report.permissions.length, KeyRound],
    ['Mapped routes', report.routeCoverage.length, Route],
    ['High-risk powers', report.highRiskPermissions.length, AlertTriangle]
  ] as const

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Badge>Phase 48</Badge>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950">Admin RBAC readiness</h1>
          <p className="mt-2 max-w-3xl text-slate-600">Separate Super Admin, ops, content, support, finance, QA and read-only powers before adding helpers or launching with a team.</p>
        </div>
        <div className="rounded-2xl border bg-white px-4 py-3 text-sm shadow-soft">
          <p className="font-black text-slate-950">Mode: {report.mode}</p>
          <p className="text-slate-600">Owner: {report.owner || 'Not set'}</p>
        </div>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(([label, value, Icon]) => (
          <Card key={label}>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm text-slate-600"><Icon className="h-4 w-4 text-emerald-700" />{label}</CardTitle>
            </CardHeader>
            <CardContent><div className="text-3xl font-black">{value}</div></CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Role model</CardTitle>
            <CardDescription>Use least-privilege roles instead of sharing one admin account.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {report.roles.map((role) => (
              <div key={role.id} className="rounded-2xl border bg-slate-50 p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="font-black text-slate-950">{role.label}</p>
                    <p className="mt-1 text-sm text-slate-600">{role.summary}</p>
                  </div>
                  <Badge>{role.permissions.length} permissions</Badge>
                </div>
                <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-slate-500">{role.launchUse}</p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold">
                  {role.canInviteAdmins && <span className="rounded-full bg-red-50 px-3 py-1 text-red-700">Invite admins</span>}
                  {role.canChangeBilling && <span className="rounded-full bg-amber-50 px-3 py-1 text-amber-700">Billing control</span>}
                  {role.canExportData && <span className="rounded-full bg-sky-50 px-3 py-1 text-sky-700">Data export</span>}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Evidence command</CardTitle>
            <CardDescription>Generate RBAC launch evidence JSON/CSV locally.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-slate-600">
            <pre className="overflow-x-auto rounded-2xl bg-slate-950 p-4 text-white">{localCommand}</pre>
            <CopyButton text={localCommand} label="Copy command" />
            <div className="rounded-2xl border bg-slate-50 p-4">
              <p className="font-black text-slate-950">Recommended flow</p>
              <ol className="mt-2 list-decimal space-y-1 pl-5">
                <li>Keep <b>ADMIN_RBAC_MODE=audit</b> while testing.</li>
                <li>Assign real team members to one role only.</li>
                <li>Review high-risk permissions manually.</li>
                <li>Switch to enforce only after QA sign-off.</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Permission matrix</CardTitle>
          <CardDescription>Mobile-safe matrix showing what every role can do.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-2xl border">
            <table className="min-w-[980px] w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="p-3">Permission</th>
                  <th className="p-3">Risk</th>
                  {report.roles.map((role) => <th key={role.id} className="p-3">{role.label}</th>)}
                </tr>
              </thead>
              <tbody>
                {report.permissions.map((permission) => (
                  <tr key={permission.id} className="border-t align-top">
                    <td className="p-3">
                      <p className="font-black text-slate-950">{permission.label}</p>
                      <p className="mt-1 max-w-md text-xs leading-5 text-slate-500">{permission.description}</p>
                    </td>
                    <td className="p-3"><Badge>{permission.risk}</Badge></td>
                    {report.roles.map((role) => <td key={`${permission.id}-${role.id}`} className="p-3"><StatusBadge status={getPermissionStatus(role.id, permission.id)} /></td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <section className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Route access map</CardTitle>
            <CardDescription>Admin pages mapped to minimum required permissions.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {report.routeCoverage.map((route) => (
              <div key={route.route} className="rounded-2xl border p-4 text-sm">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="font-black text-slate-950">{route.label}</p>
                    <p className="font-mono text-xs text-slate-500">{route.route}</p>
                  </div>
                  <Badge>{route.allowedRoles.length} roles</Badge>
                </div>
                <p className="mt-2 text-xs text-slate-600">Permission: {route.permission} · Fallback: {route.fallback}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Readiness checklist</CardTitle>
            <CardDescription>Public launch gates for role safety.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {report.checklist.map((item) => (
              <div key={item.area} className="rounded-2xl border bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-black text-slate-950">{item.area}</p>
                    <p className="mt-1 text-sm text-slate-600">{item.action}</p>
                  </div>
                  <StatusBadge status={item.status} />
                </div>
                <p className="mt-3 text-xs font-semibold text-slate-500">Evidence: {item.evidence}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
