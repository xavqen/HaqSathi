import { requireAdmin } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { getPostLaunchSupportChecklist } from '@/lib/launch/post-launch-support'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Post-launch Support Gate | Admin' }

const urgentPattern = /URGENT|FRAUD_ABUSE|PAYMENT|ACCOUNT_LOGIN|DOCUMENT_VAULT|fraud|scam|unauthorized|upi|login|vault|document/i

export default async function PostLaunchSupportPage() {
  await requireAdmin()
  const checklist = getPostLaunchSupportChecklist()
  const [contactMessages, urgentTickets, latestTickets] = await Promise.all([
    db.contactMessage.count().catch(() => 0),
    db.supportTicket.count({ where: { OR: [{ category: { in: ['FRAUD_ABUSE', 'PAYMENT', 'ACCOUNT_LOGIN', 'DOCUMENT_VAULT'] } }, { message: { contains: 'URGENT' } }] } }).catch(() => 0),
    db.supportTicket.findMany({ orderBy: { createdAt: 'desc' }, take: 6 }).catch(() => [])
  ])

  const urgentLatest = latestTickets.filter((ticket) => urgentPattern.test(`${ticket.category} ${ticket.subject} ${ticket.message}`)).length

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-white p-5 shadow-soft sm:p-7">
        <Badge>Phase 129</Badge>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Post-launch support gate</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700 sm:text-base">Verify contact intake, urgent abuse/payment/login/document escalation, safe support macros and first-24h review ownership before public traffic.</p>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardHeader><CardDescription>Contact messages</CardDescription><CardTitle className="text-3xl">{contactMessages}</CardTitle></CardHeader></Card>
        <Card><CardHeader><CardDescription>Urgent support tickets</CardDescription><CardTitle className="text-3xl text-rose-700">{urgentTickets}</CardTitle></CardHeader></Card>
        <Card><CardHeader><CardDescription>Urgent-looking latest</CardDescription><CardTitle className="text-3xl text-amber-700">{urgentLatest}</CardTitle></CardHeader></Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Launch command</CardTitle>
          <CardDescription>Run after production deploy and save the generated JSON/CSV with your launch evidence.</CardDescription>
        </CardHeader>
        <CardContent>
          <code className="block overflow-x-auto rounded-2xl bg-slate-950 p-4 text-xs font-bold text-emerald-100">POSTLAUNCH_SUPPORT_BASE_URL=https://haqsathi.site npm run launch:postlaunch-support</code>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {checklist.map((item) => (
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

      <Card>
        <CardHeader>
          <CardTitle>Safe support rules</CardTitle>
          <CardDescription>These rules protect users and the platform during launch support.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="grid gap-2 text-sm leading-6 text-slate-700 md:grid-cols-2">
            <li>Never ask for OTP, UPI PIN, CVV, passwords or full card numbers.</li>
            <li>For UPI fraud, tell users to call 1930 and inform bank/UPI app immediately.</li>
            <li>Do not promise refunds, legal outcomes, scheme approvals or complaint success.</li>
            <li>Escalate payment, login, document-vault and fraud/abuse issues to a human quickly.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
