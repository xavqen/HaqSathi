'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

type CheckoutResponse = {
  ok: boolean
  error?: string
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

export function CheckoutButton({ plan }: { plan: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  async function checkout() {
    setLoading(true)
    setMsg(null)
    const res = await fetch('/api/billing/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ plan: plan.toUpperCase() }) })
    const data = (await res.json().catch(() => ({ ok: false, error: 'Checkout failed' }))) as CheckoutResponse
    setLoading(false)
    if (!data.ok) return setMsg(data.error || 'Failed')

    if (data.mode === 'dry-run' || !data.providerOrderId || !data.providerKeyId) {
      setMsg(`Dry-run order ready: ${data.appOrderId}. Razorpay keys add karne par live checkout open hoga.`)
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
        const verify = await fetch('/api/billing/verify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ appOrderId: data.appOrderId, ...response }) })
        const verifyData = await verify.json().catch(() => ({ ok: false, error: 'Verify failed' }))
        if (!verifyData.ok) return setMsg(verifyData.error || 'Payment verify failed')
        setMsg(`Payment success. Plan upgraded to ${verifyData.plan}.`)
        router.refresh()
      }
    })
    rzp.open()
  }

  return <div><Button className="w-full" onClick={checkout} disabled={loading || plan.toUpperCase() === 'FREE'}>{plan.toUpperCase() === 'FREE' ? 'Current/basic' : loading ? 'Creating...' : 'Upgrade'}</Button>{msg && <p className="mt-2 text-xs text-slate-600">{msg}</p>}</div>
}
