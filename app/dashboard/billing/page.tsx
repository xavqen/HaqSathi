import { pricingPlans } from '@/lib/constants'
import { requireUser } from '@/lib/auth/session'
import { CheckoutButton } from '@/components/forms/checkout-button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const dynamic = 'force-dynamic'
export default async function Page() {
  const user = await requireUser()
  return <div><h1 className="text-3xl font-black">Billing</h1><p className="mt-2 text-slate-600">Current plan: <b>{user.plan}</b></p><div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">{pricingPlans.map(plan => <Card key={plan.name}><CardHeader><CardTitle>{plan.name}</CardTitle></CardHeader><CardContent><div className="text-2xl font-black">{plan.price}</div><ul className="mt-4 space-y-2 text-sm text-slate-600">{plan.features.map(f => <li key={f}>• {f}</li>)}</ul><div className="mt-5"><CheckoutButton plan={plan.name.toUpperCase()} /></div></CardContent></Card>)}</div><p className="mt-4 text-sm text-slate-500">Live Razorpay checkout supported. Keys empty hone par dry-run order create hota hai.</p></div>
}
