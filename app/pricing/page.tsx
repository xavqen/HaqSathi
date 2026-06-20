import type { Metadata } from 'next'
import { CheckCircle2 } from 'lucide-react'
import { pricingPlans } from '@/lib/constants'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckoutButton } from '@/components/forms/checkout-button'
import { getCorePageCopy } from '@/lib/i18n/page-copy'

export const metadata: Metadata = { title: 'Pricing', description: 'HaqSathi AI pricing plans for users, families and local agents.' }
export const dynamic = 'force-static'
export const revalidate = 86400

function planKey(name: string) {
  return name.toUpperCase() === 'FREE' ? 'FREE' : name.toUpperCase()
}

export default function Page() {
  const copy = getCorePageCopy('ENGLISH').pricing
  const showDevCheckoutNotice = process.env.NODE_ENV !== 'production'
  return (
    <main className="bg-slate-50">
      <section className="hs-container py-8 sm:py-12">
        <div className="rounded-[2rem] border border-emerald-100 bg-white p-6 shadow-soft sm:p-8">
          <p className="text-sm font-black uppercase tracking-wider text-emerald-700">{copy.kicker}</p>
          <h1 className="mt-3 max-w-4xl text-[2.25rem] font-black leading-none tracking-tight text-slate-950 sm:text-5xl">{copy.title}</h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600 sm:text-lg">{copy.description}</p>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {pricingPlans.map((plan) => (
            <Card key={plan.name} className={`rounded-[1.75rem] ${plan.name === 'Pro' ? 'border-emerald-500 ring-2 ring-emerald-100' : ''}`}>
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <div className="text-3xl font-black">{plan.price}</div>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <ul className="space-y-2 text-sm text-slate-600">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <CheckoutButton plan={planKey(plan.name)} returnTo="/pricing" />
              </CardContent>
            </Card>
          ))}
        </div>

        {showDevCheckoutNotice ? (
          <div className="mt-8 rounded-[1.5rem] border border-slate-200 bg-white p-5 text-sm leading-6 text-slate-700 shadow-soft">
            Local development checkout uses a dry-run order when Razorpay keys are empty. Configure Razorpay keys before live payments.
          </div>
        ) : null}
      </section>
    </main>
  )
}
