import Link from 'next/link'
import { requireUser } from '@/lib/auth/session'
import { planDisplayName } from '@/lib/billing/plan-labels'
import { getLanguageLabel } from '@/lib/i18n/languages'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

const actions = [
  { href: '/complaint', title: 'Complaint', desc: 'Refund, bank, delivery, fee issue' },
  { href: '/tools/document-reader', title: 'Doc Reader', desc: 'Invoice/SMS text se details nikaalo' },
  { href: '/tools/case-coach', title: 'Case Coach', desc: 'Score + weak points + next action' },
  { href: '/tools/follow-up-automation', title: 'Follow-ups', desc: '3/7/15 din ka plan' },
  { href: '/tools/language-draft-translator', title: 'Language Draft', desc: 'English + India/world language pack' },
  { href: '/dashboard/profile', title: 'Profile Language', desc: 'Preferred language set karo' }
]

export default async function Page() {
  const user = await requireUser()
  const language = await db.userLanguagePreference.findUnique({ where: { userId: user.id } }).catch(() => null)
  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div className="rounded-[2rem] bg-gradient-to-br from-slate-950 to-emerald-950 p-5 text-white shadow-soft sm:p-8">
        <p className="text-sm font-bold uppercase tracking-wider text-emerald-200">Mobile command center</p>
        <h1 className="mt-2 text-3xl font-black sm:text-4xl">{user.name || 'User'} · {planDisplayName(user.plan)}</h1>
        <p className="mt-2 text-sm text-emerald-50">Language: {getLanguageLabel(language?.primaryLanguage || 'ENGLISH')}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {actions.map((action) => <Link key={action.href} href={action.href} className="rounded-3xl border bg-white p-5 shadow-soft transition active:scale-[0.99] hover:-translate-y-1 hover:shadow-lg"><h2 className="text-xl font-black text-slate-950">{action.title}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{action.desc}</p><span className="mt-4 inline-flex rounded-full bg-emerald-50 px-4 py-2 text-xs font-black text-emerald-800">Open</span></Link>)}
      </div>
    </div>
  )
}
