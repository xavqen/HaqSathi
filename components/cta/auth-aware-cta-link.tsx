'use client'

import Link from 'next/link'
import { useEffect, useState, type ReactNode } from 'react'
import { buildLoginPath } from '@/lib/security/redirect'

type AuthState = 'checking' | 'guest' | 'user'

export function AuthAwareCtaLink({
  targetHref,
  children,
  className,
  ariaLabel
}: {
  targetHref: string
  children: ReactNode
  className?: string
  ariaLabel?: string
}) {
  const [state, setState] = useState<AuthState>('checking')

  useEffect(() => {
    const controller = new AbortController()
    void fetch('/api/auth/me', {
      credentials: 'same-origin',
      cache: 'no-store',
      signal: controller.signal,
      headers: { Accept: 'application/json' }
    })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => setState(data?.user ? 'user' : 'guest'))
      .catch(() => setState('guest'))
    return () => controller.abort()
  }, [])

  const href = state === 'user' ? targetHref : buildLoginPath(targetHref)

  return (
    <Link href={href} className={className} aria-label={ariaLabel} prefetch={state === 'user'}>
      {children}
    </Link>
  )
}
