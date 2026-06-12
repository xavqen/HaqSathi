'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ChevronDown, UserCircle } from 'lucide-react'
import { planBadgeClass, planDisplayName } from '@/lib/billing/plan-labels'

type UserLike = {
  name?: string | null
  email: string
  plan?: string | null
  avatarUrl?: string | null
  authProvider?: string | null
}

type Dictionary = {
  dashboard: string
  allTools: string
  profile: string
  billing: string
  language: string
  googleConnected: string
}

const defaultLabels: Dictionary = {
  dashboard: 'Dashboard',
  allTools: 'All tools',
  profile: 'Profile settings',
  billing: 'Billing & plan',
  language: 'Language',
  googleConnected: 'Google connected'
}

const ultraEase = [0.16, 1, 0.3, 1] as const

export function UserAccountMenu({
  user,
  dictionary
}: {
  user: UserLike
  dictionary?: Dictionary
}) {
  const labels = dictionary || defaultLabels
  const displayName = user.name || user.email.split('@')[0]

  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  const rootRef = useRef<HTMLDivElement>(null)
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)

    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [])

  const menuVariants = {
    hidden: reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.97 },
    visible: { opacity: 1, y: 0, scale: 1 },
    exit: reduceMotion ? { opacity: 0 } : { opacity: 0, y: -6, scale: 0.98 }
  }

  if (!mounted) {
    return null
  }

  const isFreePlan = user.plan === 'FREE'

  return (
    <div ref={rootRef} className="relative flex min-w-0 items-center gap-2">
      <div className="relative shrink-0">
        <motion.button
          type="button"
          onClick={() => setOpen((current) => !current)}
          aria-expanded={open}
          aria-haspopup="menu"
          aria-label="Account menu"
          className="flex h-10 min-w-10 transform-gpu cursor-pointer items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-2 text-sm font-bold shadow-sm transition-colors will-change-transform hover:bg-slate-50 sm:h-11 sm:min-w-11 sm:px-3"
          whileHover={reduceMotion ? undefined : { y: -1 }}
          whileTap={reduceMotion ? undefined : { scale: 0.98 }}
          transition={{ duration: 0.22, ease: ultraEase }}
        >
          {user.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.avatarUrl}
              alt="Profile"
              className="h-7 w-7 shrink-0 rounded-full border object-cover"
            />
          ) : (
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100">
              <UserCircle className="h-5 w-5 text-slate-600" />
            </span>
          )}

          <span className="hidden max-w-[7.5rem] truncate lg:inline">
            {displayName}
          </span>

          <motion.span
            animate={{ rotate: open && !reduceMotion ? 180 : 0 }}
            transition={{ duration: 0.22, ease: ultraEase }}
          >
            <ChevronDown className="h-4 w-4 shrink-0 text-slate-500" />
          </motion.span>
        </motion.button>

        <AnimatePresence>
          {open && (
            <motion.div
              key="account-popover"
              role="menu"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={menuVariants}
              transition={{ duration: 0.24, ease: ultraEase }}
              className="absolute right-0 z-[70] mt-3 w-72 origin-top-right overflow-hidden rounded-3xl border border-slate-200 bg-white p-3 shadow-2xl ring-1 ring-slate-900/5"
            >
              <div className="rounded-2xl bg-slate-50 p-3">
                <p className="truncate font-black text-slate-950">{displayName}</p>
                <p className="truncate text-xs text-slate-500">{user.email}</p>

                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className={`rounded-full border px-2.5 py-1 text-xs font-bold ${planBadgeClass(user.plan)}`}>
                    {planDisplayName(user.plan)}
                  </span>

                  {user.authProvider?.includes('google') ? (
                    <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">
                      {labels.googleConnected}
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="mt-2 grid gap-1 text-sm font-semibold text-slate-700">
                <Link role="menuitem" onClick={() => setOpen(false)} className="rounded-xl px-3 py-2 transition-colors hover:bg-slate-100" href="/dashboard">
                  {labels.dashboard}
                </Link>
                <Link role="menuitem" onClick={() => setOpen(false)} className="rounded-xl px-3 py-2 transition-colors hover:bg-slate-100" href="/tools">
                  {labels.allTools}
                </Link>
                <Link role="menuitem" onClick={() => setOpen(false)} className="rounded-xl px-3 py-2 transition-colors hover:bg-slate-100" href="/dashboard/profile">
                  {labels.profile}
                </Link>
                <Link role="menuitem" onClick={() => setOpen(false)} className="rounded-xl px-3 py-2 transition-colors hover:bg-slate-100" href="/dashboard/billing">
                  {labels.billing}
                </Link>
                <Link role="menuitem" onClick={() => setOpen(false)} className="rounded-xl px-3 py-2 transition-colors hover:bg-slate-100" href="/dashboard/language">
                  {labels.language}
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <motion.div
        whileHover={reduceMotion ? undefined : { y: -1 }}
        whileTap={reduceMotion ? undefined : { scale: 0.98 }}
        transition={{ duration: 0.22, ease: ultraEase }}
        className="hidden xl:block"
        
      >
        <Link
          href="/pricing"
          className={
            isFreePlan
              ? 'inline-flex rounded-2xl bg-primary px-4 py-2 text-sm font-black text-primary-foreground shadow-sm'
              : 'inline-flex rounded-2xl border bg-slate-50 px-4 py-2 text-sm font-black text-slate-900 shadow-sm'
          }
        >
          {isFreePlan ? 'Upgrade' : 'Pricing'}
        </Link>
      </motion.div>
    </div>
  )
}