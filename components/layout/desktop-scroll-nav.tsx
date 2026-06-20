'use client'

import Link from 'next/link'
import type { WheelEvent } from 'react'

type NavLink = { href: string; label: string }

export function DesktopScrollNav({ links }: { links: NavLink[] }) {
  function handleWheel(event: WheelEvent<HTMLElement>) {
    const element = event.currentTarget
    const verticalDelta = event.deltaY
    const horizontalDelta = event.deltaX
    if (Math.abs(verticalDelta) <= Math.abs(horizontalDelta)) return
    if (element.scrollWidth <= element.clientWidth) return
    event.preventDefault()
    element.scrollLeft += verticalDelta
  }

  return (
    <nav
      className="hidden min-w-0 max-w-[52vw] items-center gap-1 overflow-x-auto overscroll-contain scroll-smooth rounded-full border border-slate-200 bg-slate-50 p-1 text-sm font-bold text-slate-700 [scrollbar-width:none] xl:flex [&::-webkit-scrollbar]:hidden"
      aria-label="Primary navigation"
      onWheel={handleWheel}
      tabIndex={0}
    >
      {links.map((link) => (
        <Link key={link.href} href={link.href} className="shrink-0 whitespace-nowrap rounded-full px-3.5 py-2 transition hover:bg-white hover:text-primary hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500">
          {link.label}
        </Link>
      ))}
    </nav>
  )
}
