
"use client"

import { useMemo, useState } from 'react'
import { AlertTriangle, Banknote, CheckCircle2, ClipboardList, Copy, FileText, Gauge, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { buildUtilityBillDisputePlan, utilityBillIssueTypes, utilityBillTypes } from '@/lib/productivity/utility-bill-dispute-planner'

const initialState = {
  providerName: '',
  consumerId: '',
  billType: 'Electricity',
  billMonth: '',
  billAmount: '',
  usualAmount: '',
  dueDate: '',
  issueType: 'high_bill',
  meterReading: '',
  previousComplaintId: '',
  desiredResolution: 'Please verify and correct wrong charges / update payment / share written bill explanation',
  userNotes: ''
}

export function UtilityBillDisputePlannerForm() {
  const [form, setForm] = useState(initialState)
  const [copied, setCopied] = useState(false)
  const plan = useMemo(() => buildUtilityBillDisputePlan(form), [form])

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
          <Gauge className="h-6 w-6 text-emerald-700" />
          <CardTitle>Bill dispute details</CardTitle>
          <p className="sr-only">Secret-safe complaint</p>
          <CardDescription>Add bill, usage and complaint details. Do not paste OTP, UPI PIN, CVV, password or full bank/card data.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="providerName">Provider / department name</Label>
              <Input id="providerName" value={form.providerName} onChange={(e) => update('providerName', e.target.value)} placeholder="Electricity board, water dept, telecom company" />
            </div>
            <div>
              <Label htmlFor="consumerId">Consumer / account ID</Label>
              <Input id="consumerId" value={form.consumerId} onChange={(e) => update('consumerId', e.target.value)} placeholder="Use masked ID if sharing publicly" />
            </div>
            <div>
              <Label htmlFor="billType">Bill type</Label>
              <select id="billType" value={form.billType} onChange={(e) => update('billType', e.target.value)} className="mt-1 h-11 w-full rounded-xl border border-input bg-white px-3 text-sm">
                {utilityBillTypes.map((item) => <option key={item}>{item}</option>)}
              </select>
            </div>
            <div>
              <Label htmlFor="issueType">Issue type</Label>
              <select id="issueType" value={form.issueType} onChange={(e) => update('issueType', e.target.value)} className="mt-1 h-11 w-full rounded-xl border border-input bg-white px-3 text-sm">
                {utilityBillIssueTypes.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
              </select>
            </div>
            <div>
              <Label htmlFor="billMonth">Billing month / period</Label>
              <Input id="billMonth" value={form.billMonth} onChange={(e) => update('billMonth', e.target.value)} placeholder="May 2026 / 01 May - 31 May" />
            </div>
            <div>
              <Label htmlFor="dueDate">Due date</Label>
              <Input id="dueDate" type="date" value={form.dueDate} onChange={(e) => update('dueDate', e.target.value)} />
            </div>
            <div>
              <Label htmlFor="billAmount">Current bill amount</Label>
              <Input id="billAmount" inputMode="decimal" value={form.billAmount} onChange={(e) => update('billAmount', e.target.value)} placeholder="2500" />
            </div>
            <div>
              <Label htmlFor="usualAmount">Usual average amount</Label>
              <Input id="usualAmount" inputMode="decimal" value={form.usualAmount} onChange={(e) => update('usualAmount', e.target.value)} placeholder="900" />
            </div>
            <div>
              <Label htmlFor="meterReading">Meter reading / usage note</Label>
              <Input id="meterReading" value={form.meterReading} onChange={(e) => update('meterReading', e.target.value)} placeholder="Current reading, units, outage dates" />
            </div>
            <div>
              <Label htmlFor="previousComplaintId">Previous complaint ID</Label>
              <Input id="previousComplaintId" value={form.previousComplaintId} onChange={(e) => update('previousComplaintId', e.target.value)} placeholder="Ticket/reference ID if any" />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="desiredResolution">Desired resolution</Label>
              <Input id="desiredResolution" value={form.desiredResolution} onChange={(e) => update('desiredResolution', e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="userNotes">Extra notes</Label>
              <Textarea id="userNotes" value={form.userNotes} onChange={(e) => update('userNotes', e.target.value)} placeholder="Write only safe facts. Avoid secret payment/auth details." className="min-h-24" />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6">
        <Card className="border-emerald-100">
          <CardHeader>
            <Banknote className="h-6 w-6 text-emerald-700" />
            <CardTitle>Plan summary</CardTitle>
            <CardDescription>{plan.summary}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 text-sm">
              <div className="rounded-2xl bg-slate-50 p-4"><strong>Urgency:</strong> {plan.urgencyLevel}</div>
              <div className="rounded-2xl bg-slate-50 p-4"><strong>Due date:</strong> {plan.dueDate}{plan.dueInDays !== null ? ` · ${plan.dueInDays} day(s) left` : ''}</div>
              <div className="rounded-2xl bg-slate-50 p-4"><strong>Estimated difference:</strong> {plan.estimatedOvercharge !== null ? `₹${plan.estimatedOvercharge}` : 'Add current and usual amount'}</div>
              <div className="rounded-2xl bg-slate-50 p-4"><strong>Proof score:</strong> {plan.proofStrengthScore}/100</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <AlertTriangle className="h-6 w-6 text-amber-600" />
            <CardTitle>Safety warnings</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="grid gap-2 text-sm leading-6 text-slate-700">
              {plan.safetyWarnings.map((item) => <li key={item} className="flex gap-2"><ShieldCheck className="mt-1 h-4 w-4 shrink-0 text-emerald-700" />{item}</li>)}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card className="xl:col-span-2">
        <CardHeader>
          <ClipboardList className="h-6 w-6 text-emerald-700" />
          <CardTitle>Proof checklist</CardTitle>
          <CardDescription>Keep these ready before escalation.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            {plan.proofChecklist.map((item) => <div key={item} className="flex gap-2 rounded-2xl border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-700"><CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-700" />{item}</div>)}
          </div>
        </CardContent>
      </Card>

      <Card className="xl:col-span-2">
        <CardHeader>
          <FileText className="h-6 w-6 text-emerald-700" />
          <CardTitle>Escalation route</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-5">
            {plan.escalationPlan.map((step) => (
              <div key={step.step} className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-black text-emerald-700">{step.step}</p>
                <h3 className="mt-1 font-black text-slate-950">{step.target}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{step.action}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="xl:col-span-2">
        <CardHeader>
          <Copy className="h-6 w-6 text-emerald-700" />
          <CardTitle>Copy-ready bill dispute message</CardTitle>
          <CardDescription>Send only through official provider channel.</CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="max-h-[30rem] overflow-auto whitespace-pre-wrap rounded-2xl bg-slate-950 p-4 text-sm leading-6 text-emerald-50">{plan.copyReadyMessage}</pre>
          <Button onClick={copyMessage} className="mt-4 min-h-11 w-full rounded-xl sm:w-auto">{copied ? 'Copied' : 'Copy bill dispute message'}</Button>
        </CardContent>
      </Card>
    </div>
  )
}
