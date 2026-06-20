"use client"

import { useMemo, useState } from 'react'
import { AlertTriangle, CheckCircle2, ClipboardList, Copy, Plane, Receipt, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { buildTravelRefundCancellationPlan, travelBookingTypes, travelIssueTypes } from '@/lib/productivity/travel-refund-cancellation-planner'

const initialState = {
  bookingType: 'flight',
  issueType: 'Refund delayed after cancellation',
  platformOrProvider: '',
  passengerOrGuestName: '',
  bookingId: '',
  journeyOrStayDate: '',
  cancellationDate: '',
  amountPaid: '',
  refundReceived: '0',
  promisedRefundDate: '',
  cancellationReason: '',
  providerResponse: '',
  evidenceAvailable: '',
  desiredOutcome: 'Please process the pending refund or share the exact refund calculation and expected resolution timeline in writing'
}

export function TravelRefundCancellationPlannerForm() {
  const [form, setForm] = useState(initialState)
  const [copied, setCopied] = useState(false)
  const plan = useMemo(() => buildTravelRefundCancellationPlan(form), [form])

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
      <Card className="border-emerald-100">
        <CardHeader>
          <Plane className="h-7 w-7 text-emerald-700" />
          <CardTitle>Travel booking refund details</CardTitle>
          <CardDescription>Enter only booking facts. Do not enter OTP, CVV, card PIN, UPI PIN, password, full passport number or full bank details.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="bookingType">Booking type</Label>
              <select id="bookingType" value={form.bookingType} onChange={(event) => update('bookingType', event.target.value)} className="min-h-11 rounded-xl border border-input bg-white px-3 text-sm font-semibold text-slate-800">
                {travelBookingTypes.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="issueType">Issue type</Label>
              <select id="issueType" value={form.issueType} onChange={(event) => update('issueType', event.target.value)} className="min-h-11 rounded-xl border border-input bg-white px-3 text-sm font-semibold text-slate-800">
                {travelIssueTypes.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </div>
            <div className="grid gap-2"><Label htmlFor="platformOrProvider">Platform / airline / hotel / operator</Label><Input id="platformOrProvider" value={form.platformOrProvider} onChange={(event) => update('platformOrProvider', event.target.value)} placeholder="Example: IRCTC / airline / booking app / hotel" /></div>
            <div className="grid gap-2"><Label htmlFor="passengerOrGuestName">Passenger / guest name</Label><Input id="passengerOrGuestName" value={form.passengerOrGuestName} onChange={(event) => update('passengerOrGuestName', event.target.value)} placeholder="Name on booking" /></div>
            <div className="grid gap-2"><Label htmlFor="bookingId">Booking / PNR / trip ID</Label><Input id="bookingId" value={form.bookingId} onChange={(event) => update('bookingId', event.target.value)} placeholder="Booking ID / PNR / trip ID" /></div>
            <div className="grid gap-2"><Label htmlFor="journeyOrStayDate">Journey / stay / service date</Label><Input id="journeyOrStayDate" type="date" value={form.journeyOrStayDate} onChange={(event) => update('journeyOrStayDate', event.target.value)} /></div>
            <div className="grid gap-2"><Label htmlFor="cancellationDate">Cancellation / request date</Label><Input id="cancellationDate" type="date" value={form.cancellationDate} onChange={(event) => update('cancellationDate', event.target.value)} /></div>
            <div className="grid gap-2"><Label htmlFor="promisedRefundDate">Promised refund date</Label><Input id="promisedRefundDate" type="date" value={form.promisedRefundDate} onChange={(event) => update('promisedRefundDate', event.target.value)} /></div>
            <div className="grid gap-2"><Label htmlFor="amountPaid">Amount paid</Label><Input id="amountPaid" inputMode="decimal" value={form.amountPaid} onChange={(event) => update('amountPaid', event.target.value)} placeholder="Example: 5499" /></div>
            <div className="grid gap-2"><Label htmlFor="refundReceived">Refund received so far</Label><Input id="refundReceived" inputMode="decimal" value={form.refundReceived} onChange={(event) => update('refundReceived', event.target.value)} placeholder="0 if nothing received" /></div>
            <div className="grid gap-2 md:col-span-2"><Label htmlFor="cancellationReason">Reason / context</Label><Textarea id="cancellationReason" value={form.cancellationReason} onChange={(event) => update('cancellationReason', event.target.value)} placeholder="Why refund/cancellation is disputed, what happened, relevant dates" /></div>
            <div className="grid gap-2 md:col-span-2"><Label htmlFor="providerResponse">Provider response so far</Label><Textarea id="providerResponse" value={form.providerResponse} onChange={(event) => update('providerResponse', event.target.value)} placeholder="Support reply, ticket number, refund timeline, rejection reason" /></div>
            <div className="grid gap-2 md:col-span-2"><Label htmlFor="evidenceAvailable">Evidence available</Label><Textarea id="evidenceAvailable" value={form.evidenceAvailable} onChange={(event) => update('evidenceAvailable', event.target.value)} placeholder="Ticket, cancellation screenshot, payment proof, policy screenshot, chat/email proof" /></div>
            <div className="grid gap-2 md:col-span-2"><Label htmlFor="desiredOutcome">Desired outcome</Label><Textarea id="desiredOutcome" value={form.desiredOutcome} onChange={(event) => update('desiredOutcome', event.target.value)} /></div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6">
        <Card className="border-emerald-100 bg-white">
          <CardHeader>
            <ShieldCheck className="h-7 w-7 text-emerald-700" />
            <CardTitle>Refund plan</CardTitle>
            <CardDescription>{plan.summary}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-black uppercase tracking-wide text-slate-500">Urgency score</p>
                <p className="mt-1 text-3xl font-black text-slate-950">{plan.urgencyScore}/100</p>
                <p className="mt-1 text-sm font-semibold text-slate-700">{plan.urgencyLevel}</p>
                <p className="mt-1 text-xs font-bold text-slate-500">Pending: ₹{plan.pendingAmount} · Days since cancellation: {plan.daysAfterCancellation ?? 'not known'}</p>
              </div>
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
                <div className="flex gap-2 font-black"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> Refund safety</div>
                <p className="mt-1">Use official app/provider/bank channels only. Do not share OTP, CVV, UPI PIN, card PIN, password or screen-share access for refund.</p>
              </div>
              <Button onClick={copyMessage} className="min-h-12 w-full rounded-xl font-black"><Copy className="mr-2 h-4 w-4" /> {copied ? 'Copied refund message' : 'Copy refund message'}</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="xl:col-span-2">
        <CardHeader>
          <ClipboardList className="h-7 w-7 text-emerald-700" />
          <CardTitle>Proof checklist + escalation route</CardTitle>
          <CardDescription>Prepare a clean proof pack before escalating a travel refund or cancellation dispute.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 lg:grid-cols-2">
            <div>
              <h2 className="font-black text-slate-950">Proof checklist</h2>
              <ul className="mt-3 grid gap-2 text-sm leading-6 text-slate-700">
                {plan.proofChecklist.map((item) => <li key={item} className="flex gap-2"><CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-700" />{item}</li>)}
              </ul>
            </div>
            <div>
              <h2 className="font-black text-slate-950">Escalation route</h2>
              <div className="mt-3 grid gap-3">
                {plan.escalationRoute.map((item) => (
                  <div key={item.step} className="rounded-2xl border border-slate-200 bg-white p-4">
                    <p className="text-xs font-black text-emerald-700">{item.step}</p>
                    <h3 className="mt-1 font-black text-slate-950">{item.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-slate-700">{item.action}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="xl:col-span-2">
        <CardHeader>
          <Receipt className="h-7 w-7 text-emerald-700" />
          <CardTitle>Copy-ready travel refund request</CardTitle>
          <CardDescription>Review policy and attach redacted booking/payment proof before sending.</CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="max-h-[420px] overflow-auto whitespace-pre-wrap rounded-2xl bg-slate-950 p-4 text-sm leading-7 text-emerald-50">{plan.copyReadyMessage}</pre>
          <div className="mt-4 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm leading-6 text-red-950">
            <div className="font-black">Safety warnings</div>
            <ul className="mt-2 grid gap-1">
              {plan.safetyWarnings.map((item) => <li key={item}>• {item}</li>)}
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
