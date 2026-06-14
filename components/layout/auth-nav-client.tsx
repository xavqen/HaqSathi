'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { UserAccountMenu } from '@/components/layout/user-account-menu'
import { planDisplayName } from '@/lib/billing/plan-labels'
import type { ShellDictionary } from '@/lib/i18n/dictionaries'

type NavUser = {
  name?: string | null
  email: string
  plan?: string | null
  avatarUrl?: string | null
  authProvider?: string | null
}

export function AuthNavClient({ dictionary }: { dictionary: ShellDictionary }) {
  const [user, setUser] = useState<NavUser | null | undefined>(undefined)

  useEffect(() => {
    const controller = new AbortController()
    const timer = window.setTimeout(() => {
      void fetch('/api/auth/me', {
        credentials: 'same-origin',
        cache: 'no-store',
        signal: controller.signal,
        headers: { Accept: 'application/json' }
      })
        .then((response) => (response.ok ? response.json() : null))
        .then((data) => setUser(data?.user || null))
        .catch(() => setUser(null))
    }, 80)

    return () => {
      window.clearTimeout(timer)
      controller.abort()
    }
  }, [])

  if (user === undefined) {
    return (
      <div className="hidden h-10 w-24 animate-pulse rounded-2xl bg-slate-100 md:block" aria-hidden="true" />
    )
  }

  if (user) {
    return (
      <>
        <Link href="/tools" className="hidden shrink-0 rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-800 shadow-sm lg:inline-flex">
          {planDisplayName(user.plan)}
        </Link>
        <UserAccountMenu user={user} dictionary={dictionary.account} />
      </>
    )
  }

  return (
    <>
      <Link href="/login" className="hidden shrink-0 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 md:inline-flex">{dictionary.nav.login}</Link>
      <Link href="/login?next=/tools" className="compact-mobile-action inline-flex h-10 shrink-0 items-center justify-center gap-1 rounded-2xl bg-primary px-3 text-sm font-black text-primary-foreground shadow-sm transition-[transform,background-color] hover:bg-primary/90 active:scale-[0.98] sm:h-11 sm:px-5" aria-label={dictionary.nav.startFree}>
        <span className="nav-cta-text hidden sm:inline">{dictionary.nav.startFree}</span><ArrowRight className="h-4 w-4 shrink-0" />
      </Link>
    </>
  )
}
