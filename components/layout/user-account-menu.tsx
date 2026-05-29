import Link from 'next/link'
import { ChevronDown, Crown, UserCircle } from 'lucide-react'
import { planBadgeClass, planCtaLabel, planDisplayName } from '@/lib/billing/plan-labels'

type UserLike = {
  name?: string | null
  email: string
  plan?: string | null
  avatarUrl?: string | null
  authProvider?: string | null
}

export function UserAccountMenu({ user, dictionary }: { user: UserLike; dictionary?: { dashboard: string; allTools: string; profile: string; billing: string; language: string; googleConnected: string } }) {
  const labels = dictionary || { dashboard: 'Dashboard', allTools: 'All tools', profile: 'Profile settings', billing: 'Billing & plan', language: 'Language', googleConnected: 'Google connected' }
  const displayName = user.name || user.email.split('@')[0]
  return (
    <div className="relative flex min-w-0 items-center gap-2">
      <details className="hs-popover-root group relative shrink-0">
        <summary className="flex h-10 min-w-10 cursor-pointer list-none items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-2 text-sm font-bold shadow-sm transition hover:bg-slate-50 sm:h-11 sm:min-w-11 sm:px-3" aria-label="Account menu">
          {user.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.avatarUrl} alt="Profile" className="h-7 w-7 shrink-0 rounded-full border object-cover" />
          ) : (
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100"><UserCircle className="h-5 w-5 text-slate-600" /></span>
          )}
          <span className="hidden max-w-[7.5rem] truncate lg:inline">{displayName}</span>
          <ChevronDown className="h-4 w-4 shrink-0 text-slate-500" />
        </summary>
        <div className="hs-popover hs-account-popover absolute right-0 z-[70] mt-3 overflow-hidden rounded-3xl border border-slate-200 bg-white p-3 shadow-2xl ring-1 ring-slate-900/5">
          <div className="rounded-2xl bg-slate-50 p-3">
            <p className="truncate font-black text-slate-950">{displayName}</p>
            <p className="truncate text-xs text-slate-500">{user.email}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className={`rounded-full border px-2.5 py-1 text-xs font-bold ${planBadgeClass(user.plan)}`}>{planDisplayName(user.plan)}</span>
              {user.authProvider?.includes('google') && <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">{labels.googleConnected}</span>}
            </div>
          </div>
          <div className="mt-2 grid gap-1 text-sm font-semibold text-slate-700">
            <Link className="rounded-xl px-3 py-2 hover:bg-slate-100" href="/dashboard">{labels.dashboard}</Link>
            <Link className="rounded-xl px-3 py-2 hover:bg-slate-100" href="/tools">{labels.allTools}</Link>
            <Link className="rounded-xl px-3 py-2 hover:bg-slate-100" href="/dashboard/profile">{labels.profile}</Link>
            <Link className="rounded-xl px-3 py-2 hover:bg-slate-100" href="/dashboard/billing">{labels.billing}</Link>
            <Link className="rounded-xl px-3 py-2 hover:bg-slate-100" href="/dashboard/language">{labels.language}</Link>
          </div>
        </div>
      </details>
      <Link href={user.plan === 'FREE' ? '/pricing' : '/dashboard/billing'} className={`hidden rounded-2xl border px-4 py-2 text-sm font-black shadow-sm xl:inline-flex ${planBadgeClass(user.plan)}`}>
        <Crown className="mr-2 h-4 w-4" />{planCtaLabel(user.plan)}
      </Link>
    </div>
  )
}
