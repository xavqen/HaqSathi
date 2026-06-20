"use client"

import { useMemo, useState } from 'react'
import { AlertTriangle, CheckCircle2, ClipboardList, Copy, FileText, PackageCheck, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { buildReturnPickupPlan, returnPickupIssueTypes } from '@/lib/productivity/return-pickup-planner'

const initialState = {
  platformName: '',
  productName: '',
  orderId: '',
  deliveryDate: '',
  returnWindowDays: '7',
  issueType: 'wrong_item',
  itemValue: '',
  pickupStatus: '',
  packageCondition: '',
  sellerResponse: '',
  desiredResolution: 'Return pickup and refund/replacement as per policy'
}

export function ReturnPickupPlannerForm() {
  const [form, setForm] = useState(initialState)
  const [copied, setCopied] = useState(false)
  const plan = useMemo(() => buildReturnPickupPlan(form), [form])

  function update(field: keyof typeof initialState, value: string) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  async function copyMessage() {
    await navigator.clipboard.writeText(plan.copyReadyMessage)
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
      <Card>
        <CardHeader>
          <PackageCheck className="h-6 w-6 text-emerald-700" />
          <CardTitle>Return / pickup details</CardTitle>
          <CardDescription>Add order, delivery and issue details. Do not paste OTP, PIN, CVV, password or full payment details.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="platformName">Platform / seller name</Label>
              <Input id="platformName" value={form.platformName} onChange={(e) => update('platformName', e.target.value)} placeholder="Amazon, Flipkart, seller/shop name" />
            </div>
            <div>
              <Label htmlFor="productName">Product name</Label>
              <Input id="productName" value={form.productName} onChange={(e) => update('productName', e.target.value)} placeholder="Phone, shoes, appliance, clothes" />
            </div>
            <div>
              <Label htmlFor="orderId">Order / return / ticket ID</Label>
              <Input id="orderId" value={form.orderId} onChange={(e) => update('orderId', e.target.value)} placeholder="Keep partial if public sharing" />
            </div>
            <div>
              <Label htmlFor="itemValue">Amount / item value</Label>
              <Input id="itemValue" value={form.itemValue} onChange={(e) => update('itemValue', e.target.value)} placeholder="₹ amount optional" />
            </div>
            <div>
              <Label htmlFor="deliveryDate">Delivery date</Label>
              <Input id="deliveryDate" type="date" value={form.deliveryDate} onChange={(e) => update('deliveryDate', e.target.value)} />
            </div>
            <div>
              <Label htmlFor="returnWindowDays">Return window days</Label>
              <Input id="returnWindowDays" inputMode="numeric" value={form.returnWindowDays} onChange={(e) => update('returnWindowDays', e.target.value)} placeholder="7 / 10 / 30" />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="issueType">Issue type</Label>
              <select id="issueType" value={form.issueType} onChange={(e) => update('issueType', e.target.value)} className="mt-2 flex min-h-12 w-full rounded-2xl border border-input bg-background px-4 py-3 text-base outline-none focus-visible:ring-2 focus-visible:ring-ring">
                {returnPickupIssueTypes.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
              </select>
            </div>
            <div>
              <Label htmlFor="pickupStatus">Pickup / refund status</Label>
              <Textarea id="pickupStatus" value={form.pickupStatus} onChange={(e) => update('pickupStatus', e.target.value)} placeholder="Pickup scheduled/failed/done, refund pending, seller said..." rows={4} />
            </div>
            <div>
              <Label htmlFor="packageCondition">Package / product condition</Label>
              <Textarea id="packageCondition" value={form.packageCondition} onChange={(e) => update('packageCondition', e.target.value)} placeholder="Sealed/opened/damaged, missing accessories, photos available..." rows={4} />
            </div>
            <div>
              <Label htmlFor="sellerResponse">Seller/support response</Label>
              <Textarea id="sellerResponse" value={form.sellerResponse} onChange={(e) => update('sellerResponse', e.target.value)} placeholder="What support said, date, ticket, promise" rows={4} />
            </div>
            <div>
              <Label htmlFor="desiredResolution">Desired resolution</Label>
              <Textarea id="desiredResolution" value={form.desiredResolution} onChange={(e) => update('desiredResolution', e.target.value)} placeholder="Refund, replacement, pickup reschedule, written update" rows={4} />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6">
        <Card className="border-emerald-100">
          <CardHeader>
            <ShieldCheck className="h-6 w-6 text-emerald-700" />
            <CardTitle>Return summary</CardTitle>
            <CardDescription>{plan.summary}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 text-sm">
              <div className="rounded-2xl bg-slate-50 p-4"><strong>Return deadline:</strong> {plan.returnDeadline}</div>
              <div className="rounded-2xl bg-slate-50 p-4"><strong>Urgency:</strong> {plan.urgencyLevel}</div>
              <div className="rounded-2xl bg-slate-50 p-4"><strong>Proof strength:</strong> {plan.proofStrengthScore}/100</div>
              <div className="rounded-2xl bg-slate-50 p-4"><strong>Window:</strong> {plan.returnWindowDays} days</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <AlertTriangle className="h-6 w-6 text-amber-600" />
            <CardTitle>Refund scam safety</CardTitle>
            <CardDescription>Return/refund scams often ask for OTP, UPI PIN or screen sharing.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="grid gap-2 text-sm leading-6 text-slate-700">
              {plan.safetyWarnings.map((item) => <li key={item} className="flex gap-2"><AlertTriangle className="mt-1 h-4 w-4 shrink-0 text-amber-600" />{item}</li>)}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card className="xl:col-span-2">
        <CardHeader>
          <ClipboardList className="h-6 w-6 text-emerald-700" />
          <CardTitle>Proof + pickup checklist</CardTitle>
          <CardDescription>Use this before pickup, escalation or payment dispute.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 p-4">
              <h3 className="font-black text-slate-950">Proof checklist</h3>
              <ul className="mt-3 grid gap-2 text-sm leading-6 text-slate-700">
                {plan.proofChecklist.map((item) => <li key={item} className="flex gap-2"><CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-700" />{item}</li>)}
              </ul>
            </div>
            <div className="rounded-2xl border border-slate-200 p-4">
              <h3 className="font-black text-slate-950">Pickup checklist</h3>
              <ul className="mt-3 grid gap-2 text-sm leading-6 text-slate-700">
                {plan.pickupChecklist.map((item) => <li key={item} className="flex gap-2"><CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-700" />{item}</li>)}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="xl:col-span-2">
        <CardHeader>
          <FileText className="h-6 w-6 text-emerald-700" />
          <CardTitle>Escalation plan</CardTitle>
          <CardDescription>Stay inside official channels and save written proof.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-5">
            {plan.escalationPlan.map((step) => (
              <div key={step.step} className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-black text-emerald-700">{step.step}</p>
                <h3 className="mt-2 text-sm font-black text-slate-950">{step.target}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{step.action}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="xl:col-span-2">
        <CardHeader>
          <Copy className="h-6 w-6 text-emerald-700" />
          <CardTitle>Copy-ready return/refund message</CardTitle>
          <CardDescription>Edit once, attach proof and send through official app/support route.</CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="max-h-[420px] overflow-auto whitespace-pre-wrap rounded-2xl bg-slate-950 p-4 text-sm leading-7 text-emerald-50">{plan.copyReadyMessage}</pre>
          <Button onClick={copyMessage} className="mt-4 w-full sm:w-auto"><Copy className="h-4 w-4" /> {copied ? 'Copied' : 'Copy return message'}</Button>
        </CardContent>
      </Card>
    </div>
  )
}
