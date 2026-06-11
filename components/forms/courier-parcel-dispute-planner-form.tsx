"use client"

import { useMemo, useState } from 'react'
import { AlertTriangle, Boxes, CheckCircle2, ClipboardList, Copy, FileText, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { buildCourierParcelDisputePlan, courierIssueTypes } from '@/lib/productivity/courier-parcel-dispute-planner'

const initialState = {
  issueType: 'parcel-lost',
  courierOrPlatform: '',
  sellerName: '',
  trackingId: '',
  orderId: '',
  orderValue: '',
  bookingDate: '',
  promisedDeliveryDate: '',
  currentStatus: '',
  complaintId: '',
  evidenceAvailable: '',
  desiredOutcome: 'Please trace the parcel and provide refund/replacement/delivery correction timeline if applicable'
}

export function CourierParcelDisputePlannerForm() {
  const [form, setForm] = useState(initialState)
  const [copied, setCopied] = useState(false)
  const plan = useMemo(() => buildCourierParcelDisputePlan(form), [form])

  function update(field: keyof typeof initialState, value: string) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  async function copyMessage() {
    await navigator.clipboard.writeText(plan.copyReadyMessage)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.85fr)]">
      <Card className="border-emerald-100 bg-white shadow-soft">
        <CardHeader>
          <div className="flex items-center gap-2 text-sm font-black text-emerald-800"><Boxes className="h-5 w-5" /> Courier/parcel issue details</div>
          <CardTitle>Build a courier dispute plan</CardTitle>
          <CardDescription>Use masked contact/address details. Never paste OTP, full address, payment secrets or private ID numbers.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="courier-issue-type">Issue type</Label>
              <select id="courier-issue-type" value={form.issueType} onChange={(event) => update('issueType', event.target.value)} className="min-h-11 w-full rounded-xl border bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                {courierIssueTypes.map((issue) => <option key={issue.id} value={issue.id}>{issue.label}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="courier-platform">Courier/platform</Label>
              <Input id="courier-platform" value={form.courierOrPlatform} onChange={(event) => update('courierOrPlatform', event.target.value)} placeholder="Delhivery / India Post / Amazon / Flipkart" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="seller-name">Seller/merchant</Label>
              <Input id="seller-name" value={form.sellerName} onChange={(event) => update('sellerName', event.target.value)} placeholder="Seller/platform name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tracking-id">Tracking/AWB ID</Label>
              <Input id="tracking-id" value={form.trackingId} onChange={(event) => update('trackingId', event.target.value)} placeholder="AWB / tracking ID" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="order-id">Order ID</Label>
              <Input id="order-id" value={form.orderId} onChange={(event) => update('orderId', event.target.value)} placeholder="Order/invoice ID" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="order-value">Order value</Label>
              <Input id="order-value" value={form.orderValue} onChange={(event) => update('orderValue', event.target.value)} placeholder="₹ amount" inputMode="decimal" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="booking-date">Order/booking date</Label>
              <Input id="booking-date" value={form.bookingDate} onChange={(event) => update('bookingDate', event.target.value)} type="date" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="promised-delivery-date">Promised delivery date</Label>
              <Input id="promised-delivery-date" value={form.promisedDeliveryDate} onChange={(event) => update('promisedDeliveryDate', event.target.value)} type="date" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="current-status">Current tracking/support status</Label>
            <Textarea id="current-status" value={form.currentStatus} onChange={(event) => update('currentStatus', event.target.value)} placeholder="Example: marked delivered, but I did not receive it / last scan stuck at hub" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="complaint-id">Existing complaint/ticket ID</Label>
            <Input id="complaint-id" value={form.complaintId} onChange={(event) => update('complaintId', event.target.value)} placeholder="Support ticket ID if any" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="courier-evidence">Evidence available</Label>
            <Textarea id="courier-evidence" value={form.evidenceAvailable} onChange={(event) => update('evidenceAvailable', event.target.value)} placeholder="Tracking screenshots, invoice, package photos, unboxing video, support chat, call logs" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="desired-outcome">Desired outcome</Label>
            <Textarea id="desired-outcome" value={form.desiredOutcome} onChange={(event) => update('desiredOutcome', event.target.value)} />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Card className="border-emerald-100 bg-white shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><ClipboardList className="h-5 w-5 text-emerald-700" /> Plan summary</CardTitle>
            <CardDescription>Urgency score: {plan.urgencyScore}/100</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm font-semibold leading-6 text-emerald-950">{plan.summary}</div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 p-4"><div className="text-xs font-bold uppercase text-slate-500">Value at risk</div><div className="mt-1 text-2xl font-black text-slate-950">₹{plan.orderValue}</div></div>
              <div className="rounded-2xl border border-slate-200 p-4"><div className="text-xs font-bold uppercase text-slate-500">Promised date age</div><div className="mt-1 text-2xl font-black text-slate-950">{plan.promisedAge === null ? '—' : `${plan.promisedAge}d`}</div></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-emerald-700" /> Proof checklist</CardTitle></CardHeader>
          <CardContent><ul className="space-y-2 text-sm leading-6 text-slate-700">{plan.proofChecklist.map((item) => <li key={item} className="flex gap-2"><CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-700" />{item}</li>)}</ul></CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Escalation route</CardTitle></CardHeader>
          <CardContent className="space-y-3">{plan.escalationRoute.map((step) => <div key={step.step} className="rounded-2xl border border-slate-200 p-3"><div className="text-xs font-black text-emerald-700">{step.step}</div><div className="font-black text-slate-950">{step.title}</div><p className="mt-1 text-sm leading-6 text-slate-600">{step.action}</p></div>)}</CardContent>
        </Card>

        <Card className="border-amber-200 bg-amber-50">
          <CardHeader><CardTitle className="flex items-center gap-2 text-amber-950"><AlertTriangle className="h-5 w-5" /> Safety warnings</CardTitle></CardHeader>
          <CardContent><ul className="space-y-2 text-sm leading-6 text-amber-950">{plan.safetyWarnings.map((item) => <li key={item}>• {item}</li>)}</ul></CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-emerald-700" /> Copy-ready message</CardTitle><CardDescription>Review and redact private details before sending.</CardDescription></CardHeader>
          <CardContent className="space-y-3">
            <pre className="max-h-96 overflow-auto whitespace-pre-wrap rounded-2xl bg-slate-950 p-4 text-sm leading-6 text-slate-50">{plan.copyReadyMessage}</pre>
            <Button type="button" onClick={copyMessage} className="min-h-11 w-full"><Copy className="mr-2 h-4 w-4" /> {copied ? 'Copied' : 'Copy message'}</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
