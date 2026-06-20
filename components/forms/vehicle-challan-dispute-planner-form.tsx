"use client"

import { useMemo, useState } from 'react'
import { AlertTriangle, Car, CheckCircle2, ClipboardList, Copy, FileText, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { buildVehicleChallanPlan, vehicleChallanIssueTypes } from '@/lib/productivity/vehicle-challan-dispute-planner'

const initialState = {
  issueType: 'wrong-vehicle',
  vehicleType: '',
  stateOrCity: '',
  challanNumber: '',
  challanDate: '',
  amount: '',
  violationClaim: '',
  paymentStatus: '',
  evidenceAvailable: '',
  desiredOutcome: 'Please verify the challan and update/correct/cancel/refund as applicable with written status'
}

export function VehicleChallanDisputePlannerForm() {
  const [form, setForm] = useState(initialState)
  const [copied, setCopied] = useState(false)
  const plan = useMemo(() => buildVehicleChallanPlan(form), [form])

  function update(field: keyof typeof initialState, value: string) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  async function copyMessage() {
    await navigator.clipboard.writeText(plan.copyReadyMessage)
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.85fr)]">
      <Card className="border-emerald-100 bg-white shadow-soft">
        <CardHeader>
          <div className="flex items-center gap-2 text-sm font-black text-emerald-800"><Car className="h-5 w-5" /> Challan dispute details</div>
          <CardTitle>Build a traffic challan dispute plan</CardTitle>
          <CardDescription>Use official portal details only. Never paste OTP, UPI PIN, CVV, password or full personal IDs.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="challan-issue-type">Issue type</Label>
              <select id="challan-issue-type" value={form.issueType} onChange={(event) => update('issueType', event.target.value)} className="min-h-11 w-full rounded-xl border bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                {vehicleChallanIssueTypes.map((issue) => <option key={issue.id} value={issue.id}>{issue.label}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="vehicle-type">Vehicle type</Label>
              <Input id="vehicle-type" value={form.vehicleType} onChange={(event) => update('vehicleType', event.target.value)} placeholder="Bike / car / auto / commercial vehicle" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state-city">State/city</Label>
              <Input id="state-city" value={form.stateOrCity} onChange={(event) => update('stateOrCity', event.target.value)} placeholder="Delhi / Mumbai / Jharkhand / Bengaluru" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="challan-number">Challan number</Label>
              <Input id="challan-number" value={form.challanNumber} onChange={(event) => update('challanNumber', event.target.value)} placeholder="Challan/e-challan number" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="challan-date">Challan date</Label>
              <Input id="challan-date" type="date" value={form.challanDate} onChange={(event) => update('challanDate', event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="challan-amount">Amount</Label>
              <Input id="challan-amount" value={form.amount} onChange={(event) => update('amount', event.target.value)} placeholder="₹1,000" inputMode="decimal" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="violation-claim">Violation shown</Label>
            <Textarea id="violation-claim" value={form.violationClaim} onChange={(event) => update('violationClaim', event.target.value)} placeholder="What violation is written on challan? Why do you think it is wrong?" className="min-h-24" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="payment-status">Payment/status</Label>
            <Textarea id="payment-status" value={form.paymentStatus} onChange={(event) => update('paymentStatus', event.target.value)} placeholder="Paid but pending, unpaid, duplicate, court/virtual court, towing receipt, etc." className="min-h-24" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="challan-evidence">Evidence available</Label>
            <Textarea id="challan-evidence" value={form.evidenceAvailable} onChange={(event) => update('evidenceAvailable', event.target.value)} placeholder="Challan screenshot, RC, payment receipt, UTR, location/time proof, number plate mismatch, sale/transfer proof..." className="min-h-24" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="challan-outcome">Desired outcome</Label>
            <Textarea id="challan-outcome" value={form.desiredOutcome} onChange={(event) => update('desiredOutcome', event.target.value)} className="min-h-20" />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Card className="border-emerald-100 bg-emerald-50/70 shadow-soft">
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle>Urgency score: {plan.urgencyScore}/100</CardTitle>
                <CardDescription>{plan.urgencyLevel}</CardDescription>
              </div>
              <ShieldCheck className="h-8 w-8 text-emerald-700" />
            </div>
          </CardHeader>
          <CardContent><p className="text-sm leading-6 text-emerald-950">{plan.summary}</p></CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><ClipboardList className="h-5 w-5 text-emerald-700" /> Proof checklist</CardTitle></CardHeader>
          <CardContent><ul className="space-y-2 text-sm leading-6 text-slate-700">{plan.proofChecklist.map((item) => <li key={item} className="flex gap-2"><CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-700" />{item}</li>)}</ul></CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Escalation route</CardTitle><CardDescription>Use official e-challan/traffic authority channels only.</CardDescription></CardHeader>
          <CardContent className="space-y-3">{plan.escalationRoute.map((item) => <div key={item.step} className="rounded-2xl border border-slate-200 p-3"><div className="text-xs font-black text-emerald-700">{item.step}</div><div className="font-black text-slate-950">{item.title}</div><p className="text-sm leading-6 text-slate-600">{item.action}</p></div>)}</CardContent>
        </Card>

        <Card className="border-amber-200 bg-amber-50">
          <CardHeader><CardTitle className="flex items-center gap-2 text-amber-950"><AlertTriangle className="h-5 w-5" /> Safety warnings</CardTitle></CardHeader>
          <CardContent><ul className="space-y-2 text-sm leading-6 text-amber-950">{plan.safetyWarnings.map((warning) => <li key={warning}>• {warning}</li>)}</ul></CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-emerald-700" /> Copy-ready challan message</CardTitle>
            <CardDescription>Review and edit before sending through official portal/email/desk.</CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="max-h-80 overflow-auto whitespace-pre-wrap rounded-2xl bg-slate-950 p-4 text-xs leading-6 text-slate-50">{plan.copyReadyMessage}</pre>
            <Button onClick={copyMessage} className="mt-3 min-h-11 w-full rounded-2xl font-black"><Copy className="mr-2 h-4 w-4" />{copied ? 'Copied' : 'Copy message'}</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
