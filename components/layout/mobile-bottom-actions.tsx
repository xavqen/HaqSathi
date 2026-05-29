'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ClipboardCheck, FileText, Home, Search, ShieldAlert } from 'lucide-react'

const items = [
  { href: '/', label: 'Home', icon: Home, match: (path: string) => path === '/' },
  { href: '/tools', label: 'Tools', icon: Search, match: (path: string) => path === '/tools' || path.startsWith('/tools/') },
  { href: '/complaint', label: 'Complaint', icon: FileText, match: (path: string) => path.startsWith('/complaint') || path.startsWith('/refund') },
  { href: '/tools/smart-complaint-wizard', label: 'Wizard', icon: ClipboardCheck, match: (path: string) => path.startsWith('/tools/smart-complaint-wizard') || path.startsWith('/dashboard/smart-wizard') },
  { href: '/tools/scam-radar', label: 'Radar', icon: ShieldAlert, match: (path: string) => path.startsWith('/tools/scam-radar') || path.startsWith('/dashboard/scam-radar') }
]

const hiddenPrefixes = ['/login', '/register', '/forgot-password', '/reset-password', '/admin']

export function MobileBottomActions() {
  const pathname = usePathname() || '/'
  if (hiddenPrefixes.some((prefix) => pathname.startsWith(prefix))) return null

  return (
    <nav aria-label="Mobile quick actions" className="fixed inset-x-0 bottom-0 z-40 w-full border-t border-slate-200 bg-white/96 px-2 pb-[calc(env(safe-area-inset-bottom)+0.45rem)] pt-2 shadow-[0_-12px_35px_rgba(15,23,42,0.10)] backdrop-blur-xl md:hidden">
      <div className="mx-auto grid max-w-md grid-cols-5 gap-1">
        {items.map((item) => {
          const active = item.match(pathname)
          return (
            <Link key={item.href} href={item.href} aria-current={active ? 'page' : undefined} className={`flex min-h-[54px] min-w-0 flex-col items-center justify-center rounded-2xl px-1 text-[10px] font-black leading-none transition active:scale-95 ${active ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' : 'text-slate-600 active:bg-emerald-50 active:text-emerald-700'}`}>
              <item.icon className="mb-1.5 h-5 w-5 shrink-0" />
              <span className="max-w-full truncate">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
