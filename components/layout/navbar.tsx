import Link from 'next/link'
import { ShieldCheck } from 'lucide-react'
import { getCurrentUser } from '@/lib/auth/session'
import { UserAccountMenu } from '@/components/layout/user-account-menu'

const links = [
  { href: '/complaint', label: 'Complaint' },
  { href: '/upi-help', label: 'UPI Help' },
  { href: '/scheme-finder', label: 'Schemes' },
  { href: '/documents', label: 'Documents' },
  { href: '/chat', label: 'AI Chat' },
  { href: '/templates', label: 'Templates' },
  { href: '/tools', label: 'Tools' },
  { href: '/knowledge-base', label: 'Knowledge' },
  { href: '/partners', label: 'Partners' },
  { href: '/filing-guides', label: 'Guides' },
  { href: '/emergency', label: 'Emergency' },
  { href: '/resources', label: 'Resources' },
  { href: '/official-sources', label: 'Sources' },
  { href: '/authority-directory', label: 'Authority' },
  { href: '/state-guides', label: 'States' },
  { href: '/success-stories', label: 'Stories' },
  { href: '/search', label: 'Search' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/launch-readiness', label: 'Launch' }
]

export async function Navbar() {
  const user = await getCurrentUser()
  return (
    <header className="sticky top-0 z-40 border-b bg-white/85 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-bold text-slate-950">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground"><ShieldCheck className="h-5 w-5" /></span>
          <span>HaqSathi AI</span>
        </Link>
        <nav className="hidden items-center gap-5 text-sm font-medium text-slate-600 lg:flex">
          {links.map((link) => <Link key={link.href} href={link.href} className="hover:text-slate-950">{link.label}</Link>)}
        </nav>
        <div className="flex items-center gap-2">
          {user ? (
            <UserAccountMenu user={user} />
          ) : (
            <>
              <Link href="/login" className="hidden rounded-xl border px-4 py-2 text-sm font-semibold hover:bg-slate-50 sm:inline-flex">Login</Link>
              <Link href="/complaint" className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90">Start Free</Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
