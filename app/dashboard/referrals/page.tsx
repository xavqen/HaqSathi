import { requireUser } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ReferralForm } from '@/components/forms/referral-form'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Referrals | HaqSathi AI' }

export default async function ReferralsPage() {
  const user = await requireUser()
  const invites = await db.referralInvite.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' }, take: 20 })
  const created = invites.length
  const converted = invites.filter((i) => i.status === 'CONVERTED').length

  return <div className="space-y-6">
    <div>
      <h1 className="text-3xl font-bold">Referral growth</h1>
      <p className="mt-2 text-slate-600">Invite friends, clients or local service users and unlock bonus usage.</p>
    </div>
    <div className="grid gap-4 md:grid-cols-3">
      <Card><CardHeader><CardTitle>Total invites</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{created}</p></CardContent></Card>
      <Card><CardHeader><CardTitle>Converted</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{converted}</p></CardContent></Card>
      <Card><CardHeader><CardTitle>Your plan</CardTitle></CardHeader><CardContent><Badge>{user.plan}</Badge></CardContent></Card>
    </div>
    <ReferralForm />
    <Card><CardHeader><CardTitle>Recent referral links</CardTitle></CardHeader><CardContent className="space-y-3">
      {invites.length === 0 && <p className="text-sm text-slate-600">No referrals yet.</p>}
      {invites.map((invite) => <div key={invite.id} className="rounded-2xl border p-4 text-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"><b>{invite.code}</b><Badge>{invite.status}</Badge></div>
        <p className="mt-1 text-slate-600">{invite.email || 'Open share link'} · {invite.reward || 'Bonus reward'}</p>
      </div>)}
    </CardContent></Card>
  </div>
}
