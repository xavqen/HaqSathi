import { pricingPlans } from '@/lib/constants'
import { requireUser } from '@/lib/auth/session'
import { CheckoutButton } from '@/components/forms/checkout-button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { planBadgeClass, planDisplayName } from '@/lib/billing/plan-labels'
import { normalizePlan } from '@/lib/billing/plans'
import { syncUserPlanFromBilling } from '@/lib/billing/entitlements'

export const dynamic = 'force-dynamic'

function planKey(name: string) {
  return normalizePlan(name)
}

export default async function Page() {
  const user = await requireUser()
  const entitlement = await syncUserPlanFromBilling(user.id, user.plan)
  const currentPlan = entitlement.plan
  const showDevCheckoutNotice = process.env.NODE_ENV !== 'production'

  return (
    <div className="space-y-6">
      <div className="rounded-[1.75rem] border border-emerald-100 bg-white p-5 shadow-soft sm:p-6">
        <p className="text-sm font-black uppercase tracking-wider text-emerald-700">Billing</p>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-black text-slate-950">Subscription & billing</h1>
            <p className="mt-2 text-slate-600">Your current access is synced from your user record, active subscription and latest paid Razorpay order.</p>
          </div>
          <span className={`inline-flex w-fit rounded-full border px-4 py-2 text-sm font-black ${planBadgeClass(currentPlan)}`}>{planDisplayName(currentPlan)}</span>
        </div>
        <div className="mt-5 grid gap-3 text-sm sm:grid-cols-3">
          <div className="rounded-2xl bg-slate-50 p-4"><b>Current plan</b><p className="mt-1 text-slate-600">{currentPlan}</p></div>
          <div className="rounded-2xl bg-slate-50 p-4"><b>Source</b><p className="mt-1 text-slate-600">{entitlement.source.replace('_', ' ')}</p></div>
          <div className="rounded-2xl bg-slate-50 p-4"><b>Last paid order</b><p className="mt-1 text-slate-600">{entitlement.latestPaidOrder ? `${entitlement.latestPaidOrder.plan} · ${entitlement.latestPaidOrder.status}` : 'No paid order yet'}</p></div>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {pricingPlans.map((plan) => {
          const key = planKey(plan.name)
          const isCurrent = key === currentPlan
          return (
            <Card key={plan.name} className={`rounded-[1.75rem] ${isCurrent ? 'border-emerald-500 ring-2 ring-emerald-100' : ''}`}>
              <CardHeader>
                <div className="flex items-center justify-between gap-3">
                  <CardTitle>{plan.name}</CardTitle>
                  {isCurrent ? <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-800">Current</span> : null}
                </div>
                <div className="text-2xl font-black">{plan.price}</div>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="mt-1 space-y-2 text-sm text-slate-600">{plan.features.map((feature) => <li key={feature}>• {feature}</li>)}</ul>
                <div className="mt-5"><CheckoutButton plan={key} currentPlan={currentPlan} returnTo="/dashboard/billing" /></div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {showDevCheckoutNotice ? <p className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">Local development checkout can use a dry-run order when Razorpay keys are empty. Configure Razorpay keys before live payments.</p> : <p className="text-sm text-slate-500">Payments are processed securely through Razorpay when a paid plan is selected.</p>}
    </div>
  )
}
