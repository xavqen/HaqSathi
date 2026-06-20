'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { buildLoginPath } from '@/lib/security/redirect'
import { comparePlans, normalizePlan, type PlanKey } from '@/lib/billing/plans'

type CheckoutResponse = {
  ok: boolean
  error?: string
  loginPath?: string
  mode?: 'razorpay' | 'dry-run'
  appOrderId?: string
  providerOrderId?: string | null
  providerKeyId?: string | null
  amount?: number
  currency?: string
  plan?: string
  user?: { name?: string | null; email?: string }
}

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void }
  }
}

function loadRazorpayScript() {
  return new Promise<boolean>((resolve) => {
    if (window.Razorpay) return resolve(true)
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

function buttonLabel(targetPlan: PlanKey, currentPlan: PlanKey | null, loading: boolean, checkingAuth = false) {
  if (checkingAuth) return 'Checking...'
  if (loading) return 'Creating...'
  if (targetPlan === 'FREE') return currentPlan === 'FREE' || !currentPlan ? 'Current/basic' : 'Included'
  if (currentPlan && comparePlans(currentPlan, targetPlan) === 0) return 'Current plan'
  if (currentPlan && comparePlans(currentPlan, targetPlan) > 0) return 'Included in current plan'
  return currentPlan ? 'Upgrade' : 'Login to upgrade'
}

export function CheckoutButton({ plan, currentPlan: currentPlanProp, returnTo = '/pricing' }: { plan: string; currentPlan?: string | null; returnTo?: string }) {
  const router = useRouter()
  const targetPlan = useMemo(() => normalizePlan(plan), [plan])
  const [currentPlan, setCurrentPlan] = useState<PlanKey | null>(currentPlanProp ? normalizePlan(currentPlanProp) : null)
  const [authChecked, setAuthChecked] = useState(Boolean(currentPlanProp))
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  useEffect(() => {
    if (currentPlanProp) return
    const controller = new AbortController()
    void fetch('/api/auth/me', {
      credentials: 'same-origin',
      cache: 'no-store',
      signal: controller.signal,
      headers: { Accept: 'application/json' }
    })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        setCurrentPlan(data?.user?.plan ? normalizePlan(data.user.plan) : null)
        setAuthChecked(true)
      })
      .catch(() => {
        setCurrentPlan(null)
        setAuthChecked(true)
      })
    return () => controller.abort()
  }, [currentPlanProp])

  const checkingAuth = !authChecked && !currentPlanProp
  const disabled = checkingAuth || loading || targetPlan === 'FREE' || Boolean(currentPlan && comparePlans(currentPlan, targetPlan) >= 0)

  async function checkout() {
    if (!authChecked || loading) return
    if (!currentPlan) {
      router.push(buildLoginPath(returnTo))
      return
    }
    if (disabled) return

    setLoading(true)
    setMsg(null)
    try {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        credentials: 'same-origin',
        cache: 'no-store',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: targetPlan })
      })
      const data = (await res.json().catch(() => ({ ok: false, error: 'Checkout failed' }))) as CheckoutResponse
      setLoading(false)
      if (res.status === 401 || data.loginPath) {
        router.push(data.loginPath || buildLoginPath(returnTo))
        return
      }
      if (!data.ok) return setMsg(data.error || 'Failed')

      if (data.mode === 'dry-run' || !data.providerOrderId || !data.providerKeyId) {
        const isProduction = process.env.NODE_ENV === 'production'
        setMsg(isProduction ? 'Checkout is temporarily unavailable. Please contact support.' : `Local checkout test order ready: ${data.appOrderId}. Configure Razorpay keys before live checkout.`)
        return
      }

      const loaded = await loadRazorpayScript()
      if (!loaded || !window.Razorpay) return setMsg('Razorpay checkout script load nahi hua.')

      const rzp = new window.Razorpay({
        key: data.providerKeyId,
        amount: data.amount,
        currency: data.currency || 'INR',
        name: 'HaqSathi AI',
        description: `${data.plan} subscription`,
        order_id: data.providerOrderId,
        prefill: { name: data.user?.name || '', email: data.user?.email || '' },
        handler: async (response: Record<string, string>) => {
          const verify = await fetch('/api/billing/verify', {
            method: 'POST',
            credentials: 'same-origin',
            cache: 'no-store',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ appOrderId: data.appOrderId, ...response })
          })
          const verifyData = await verify.json().catch(() => ({ ok: false, error: 'Verify failed' }))
          if (!verifyData.ok) return setMsg(verifyData.error || 'Payment verify failed')
          setCurrentPlan(normalizePlan(verifyData.plan))
          setMsg(`Payment success. Plan upgraded to ${verifyData.plan}.`)
          router.refresh()
        }
      })
      rzp.open()
    } catch {
      setLoading(false)
      setMsg('Checkout network error. Please try again.')
    }
  }

  return (
    <div>
      <Button className="w-full" onClick={checkout} disabled={disabled} variant={disabled ? 'outline' : 'default'}>
        {buttonLabel(targetPlan, currentPlan, loading, checkingAuth)}
      </Button>
      {msg && <p className="mt-2 text-xs text-slate-600">{msg}</p>}
    </div>
  )
}
