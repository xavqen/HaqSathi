import { Fingerprint, KeyRound, ShieldCheck, Smartphone, UserCheck } from 'lucide-react'
import { requireUser } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { getAccountSecurityReadinessReport } from '@/lib/security/account-security'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Security | HaqSathi AI' }

function StatusPill({ label }: { label: string }) {
  const className = label === 'READY_TO_TEST' || label === 'PASS'
    ? 'bg-emerald-50 text-emerald-700'
    : label === 'BLOCKED'
      ? 'bg-red-50 text-red-700'
      : 'bg-amber-50 text-amber-700'
  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ${className}`}>{label}</span>
}

export default async function Page() {
  const user = await requireUser()
  const report = getAccountSecurityReadinessReport()
  const [sessions, events] = await Promise.all([
    db.authSession.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' }, take: 10 }),
    db.userActivity.findMany({ where: { userId: user.id, action: { in: ['LOGIN', 'REGISTER', 'PROFILE_UPDATE', 'PASSWORD_RESET_REQUEST'] } }, orderBy: { createdAt: 'desc' }, take: 20 })
  ])

  const securityCards = [
    {
      title: '2FA',
      icon: Smartphone,
      status: report.enforcement === 'required' || report.enforcement === 'admin_only' ? 'READY_TO_TEST' : 'MANUAL_REQUIRED',
      description: report.enforcement === 'required' ? 'Authenticator-app 2FA can be required after recovery QA.' : 'Authenticator-app 2FA is prepared for safe rollout.'
    },
    {
      title: 'Passkeys',
      icon: Fingerprint,
      status: report.passkeysEnabled ? 'READY_TO_TEST' : 'MANUAL_REQUIRED',
      description: 'Use only after HTTPS production domain and browser/device testing.'
    },
    {
      title: 'Backup codes',
      icon: KeyRound,
      status: report.backupCodesEnabled ? 'READY_TO_TEST' : 'MANUAL_REQUIRED',
      description: 'Required before forcing 2FA so users do not get locked out.'
    },
    {
      title: 'Verified email',
      icon: UserCheck,
      status: user.emailVerifiedAt ? 'PASS' : 'MANUAL_REQUIRED',
      description: user.emailVerifiedAt ? 'Your email is verified.' : 'Verify your email before using sensitive account features.'
    }
  ]

  return (
    <div className="space-y-6">
      <div>
        <Badge>Account safety</Badge>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950">Security</h1>
        <p className="mt-2 max-w-3xl text-slate-600">Review sessions, account activity, 2FA readiness, Passkeys, Backup codes and important security signals.</p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {securityCards.map((item) => {
          const Icon = item.icon
          return (
            <Card key={item.title}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50"><Icon className="h-5 w-5 text-emerald-700" /></span>
                  <StatusPill label={item.status} />
                </div>
                <CardTitle>{item.title}</CardTitle>
                <CardDescription>{item.description}</CardDescription>
              </CardHeader>
            </Card>
          )
        })}
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Active sessions</CardTitle>
            <CardDescription>Recent session records connected to your account.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-600">
            {sessions.map((session) => (
              <div key={session.id} className="rounded-2xl bg-slate-50 p-3">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
                  <div>
                    <p>Created: {session.createdAt.toLocaleString('en-IN')}</p>
                    <p>Expires: {session.expiresAt.toLocaleString('en-IN')}</p>
                  </div>
                </div>
              </div>
            ))}
            {!sessions.length ? <p>No active session record found.</p> : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account activity</CardTitle>
            <CardDescription>Important actions such as login, registration and password reset request.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-600">
            {events.map((event) => (
              <div key={event.id} className="rounded-2xl bg-slate-50 p-3">
                <p className="font-bold text-slate-900">{event.action}</p>
                <p>{event.createdAt.toLocaleString('en-IN')}</p>
              </div>
            ))}
            {!events.length ? <p>No activity yet.</p> : null}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
