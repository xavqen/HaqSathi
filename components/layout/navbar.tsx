import Link from 'next/link'
import { ArrowRight, Menu, Search, ShieldCheck } from 'lucide-react'
import { cookies } from 'next/headers'
import { getCurrentUser } from '@/lib/auth/session'
import { UserAccountMenu } from '@/components/layout/user-account-menu'
import { planDisplayName } from '@/lib/billing/plan-labels'
import { LanguageSwitcher } from '@/components/i18n/language-switcher'
import { getShellDictionary } from '@/lib/i18n/dictionaries'
import { normalizeLanguageCode } from '@/lib/i18n/languages'

export async function Navbar() {
  const user = await getCurrentUser()
  const store = await cookies()
  const language = normalizeLanguageCode(store.get('haqsathi_language')?.value)
  const dictionary = getShellDictionary(language)
  const startHref = user ? '/tools' : '/login?next=/tools'
  const primaryLinks = [
    { href: '/complaint', label: dictionary.nav.complaint },
    { href: '/tools/smart-complaint-wizard', label: dictionary.nav.smartWizard },
    { href: '/tools/scam-radar', label: dictionary.nav.scamRadar },
    { href: '/upi-help', label: dictionary.nav.upiHelp },
    { href: '/scheme-finder', label: dictionary.nav.schemes },
    { href: '/documents', label: dictionary.nav.documents },
    { href: '/tools', label: dictionary.nav.tools }
  ]
  const mobileLinks = [
    { href: '/tools', label: dictionary.nav.allTools },
    { href: '/complaint', label: dictionary.nav.complaint },
    { href: '/tools/smart-complaint-wizard', label: dictionary.nav.smartWizard },
    { href: '/tools/scam-radar', label: dictionary.nav.scamRadar },
    { href: '/upi-help', label: dictionary.nav.upiHelp },
    { href: '/scheme-finder', label: dictionary.nav.schemes },
    { href: '/documents', label: dictionary.nav.documents },
    { href: '/search', label: dictionary.nav.search }
  ]

  return (
    <header className="sticky top-0 z-50 w-full max-w-full border-b border-slate-200/80 bg-white/96 shadow-[0_10px_30px_rgba(15,23,42,0.05)] backdrop-blur-xl">
      <div className="mx-auto flex h-[60px] w-full max-w-7xl items-center justify-between gap-2 px-3 sm:h-[68px] sm:gap-3 sm:px-5 lg:px-6">
        <Link href="/" className="group flex min-w-0 shrink items-center gap-2 text-slate-950 sm:gap-2.5" aria-label="HaqSathi AI home">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm transition group-hover:scale-105 sm:h-11 sm:w-11">
            <ShieldCheck className="h-5 w-5" />
          </span>
          <span className="nav-brand-wordmark min-w-0 max-w-[8.5rem] sm:max-w-[11rem] lg:max-w-none">
            <span className="block truncate text-base font-black leading-5 sm:text-lg">HaqSathi AI</span>
            <span className="hidden truncate text-[11px] font-semibold text-slate-500 sm:block">{dictionary.nav.appSubline}</span>
          </span>
        </Link>

        <nav className="hidden min-w-0 max-w-[52vw] items-center gap-1 overflow-hidden rounded-full border border-slate-200 bg-slate-50 p-1 text-sm font-bold text-slate-700 xl:flex" aria-label="Primary navigation">
          {primaryLinks.map((link) => (
            <Link key={link.href} href={link.href} className="shrink-0 whitespace-nowrap rounded-full px-3.5 py-2 transition hover:bg-white hover:text-primary hover:shadow-sm">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex min-w-0 shrink-0 items-center justify-end gap-1.5 sm:gap-2">
          <LanguageSwitcher current={language} label={dictionary.account.language} />
          <Link href="/search" className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-slate-50 md:inline-flex" aria-label={dictionary.nav.search}>
            <Search className="h-4 w-4" />
          </Link>
          {user ? (
            <>
              <Link href="/tools" className="hidden shrink-0 rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-800 shadow-sm lg:inline-flex">
                {planDisplayName(user.plan)}
              </Link>
              <UserAccountMenu user={user} dictionary={dictionary.account} />
            </>
          ) : (
            <>
              <Link href="/login" className="hidden shrink-0 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50 md:inline-flex">{dictionary.nav.login}</Link>
              <Link href={startHref} className="compact-mobile-action inline-flex h-10 shrink-0 items-center justify-center gap-1 rounded-2xl bg-primary px-3 text-sm font-black text-primary-foreground shadow-sm hover:bg-primary/90 sm:h-11 sm:px-5" aria-label={dictionary.nav.startFree}>
                <span className="nav-cta-text hidden sm:inline">{dictionary.nav.startFree}</span><ArrowRight className="h-4 w-4 shrink-0" />
              </Link>
            </>
          )}
          <Link href="/tools" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 xl:hidden" aria-label="Open all tools">
            <Menu className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <nav aria-label="Quick mobile navigation" className="mobile-only-nav mobile-header-scroll border-t border-slate-100 bg-white/95 md:hidden">
        <div className="mx-auto flex w-full max-w-7xl gap-2 overflow-x-auto px-3 py-2 sm:px-5">
          {mobileLinks.map((link, index) => (
            <Link
              key={link.href}
              href={link.href}
              className={`shrink-0 rounded-full border px-3.5 py-2 text-xs font-black shadow-sm transition active:scale-95 ${index === 0 ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-slate-200 bg-white text-slate-700 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-800'}`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  )
}
