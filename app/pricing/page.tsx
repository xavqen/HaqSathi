import type { Metadata } from 'next'
import { pricingPlans } from '@/lib/constants'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckoutButton } from '@/components/forms/checkout-button'

export const metadata: Metadata = { title: 'Pricing', description: 'HaqSathi AI pricing plans for users, families and local agents.' }

function planKey(name: string) {
  return name.toUpperCase() === 'FREE' ? 'FREE' : name.toUpperCase()
}

export default function Page() {
  return <main className="mx-auto max-w-7xl px-4 py-10"><h1 className="text-4xl font-black">Pricing</h1><p className="mt-3 max-w-2xl text-slate-600">Free se start karo. Pro, Family aur Agent plans live Razorpay-ready checkout ke saath.</p><div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-4">{pricingPlans.map((plan) => <Card key={plan.name} className={plan.name === 'Pro' ? 'border-emerald-500' : ''}><CardHeader><CardTitle>{plan.name}</CardTitle><div className="text-3xl font-black">{plan.price}</div><CardDescription>{plan.description}</CardDescription></CardHeader><CardContent className="space-y-5"><ul className="space-y-2 text-sm text-slate-600">{plan.features.map((feature) => <li key={feature}>• {feature}</li>)}</ul><CheckoutButton plan={planKey(plan.name)} /></CardContent></Card>)}</div><div className="mt-8 rounded-2xl bg-slate-50 p-5 text-sm text-slate-700">Local dev me Razorpay keys empty honge to dry-run order banega. Live checkout ke liye RAZORPAY_KEY_ID, NEXT_PUBLIC_RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, RAZORPAY_WEBHOOK_SECRET set karo.</div></main>
}
