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

export function UserAccountMenu({ user }: { user: UserLike }) {
  const displayName = user.name || user.email.split('@')[0]
  return (
    <div className="flex items-center gap-2">
      <details className="group relative">
        <summary className="flex cursor-pointer list-none items-center gap-2 rounded-2xl border bg-white px-3 py-2 text-sm font-semibold shadow-sm hover:bg-slate-50">
          {user.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.avatarUrl} alt="Profile" className="h-7 w-7 rounded-full border object-cover" />
          ) : (
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100"><UserCircle className="h-5 w-5 text-slate-600" /></span>
          )}
          <span className="hidden max-w-28 truncate sm:inline">{displayName}</span>
          <ChevronDown className="h-4 w-4 text-slate-500" />
        </summary>
        <div className="absolute right-0 mt-3 w-72 overflow-hidden rounded-3xl border bg-white p-3 shadow-xl ring-1 ring-slate-900/5">
          <div className="rounded-2xl bg-slate-50 p-3">
            <p className="truncate font-bold text-slate-950">{displayName}</p>
            <p className="truncate text-xs text-slate-500">{user.email}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className={`rounded-full border px-2.5 py-1 text-xs font-bold ${planBadgeClass(user.plan)}`}>{planDisplayName(user.plan)}</span>
              {user.authProvider?.includes('google') && <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">Google connected</span>}
            </div>
          </div>
          <div className="mt-2 grid gap-1 text-sm font-semibold text-slate-700">
            <Link className="rounded-xl px-3 py-2 hover:bg-slate-100" href="/dashboard">Dashboard</Link>
            <Link className="rounded-xl px-3 py-2 hover:bg-slate-100" href="/dashboard/profile">Profile settings</Link>
            <Link className="rounded-xl px-3 py-2 hover:bg-slate-100" href="/dashboard/billing">Billing & plan</Link>
            <Link className="rounded-xl px-3 py-2 hover:bg-slate-100" href="/dashboard/security">Security</Link>
          </div>
        </div>
      </details>
      <Link href={user.plan === 'FREE' ? '/pricing' : '/dashboard/billing'} className={`hidden rounded-xl border px-4 py-2 text-sm font-bold sm:inline-flex ${planBadgeClass(user.plan)}`}>
        <Crown className="mr-2 h-4 w-4" />{planCtaLabel(user.plan)}
      </Link>
    </div>
  )
}
