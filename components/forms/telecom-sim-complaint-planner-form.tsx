"use client"

import { useMemo, useState } from 'react'
import { AlertTriangle, CheckCircle2, ClipboardList, Copy, FileText, RadioTower, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { buildTelecomSimComplaintPlan, telecomIssueTypes } from '@/lib/productivity/telecom-sim-complaint-planner'

const initialState = {
  issueType: 'recharge-failed',
  operatorName: '',
  mobileNumberMasked: '',
  rechargeAmount: '',
  billAmount: '',
  transactionId: '',
  issueDate: '',
  complaintId: '',
  lastResponse: '',
  evidenceAvailable: '',
  desiredOutcome: 'Please resolve the issue, share written reason/timeline, and process refund/correction/activation if applicable'
}

export function TelecomSimComplaintPlannerForm() {
  const [form, setForm] = useState(initialState)
  const [copied, setCopied] = useState(false)
  const plan = useMemo(() => buildTelecomSimComplaintPlan(form), [form])

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
          <div className="flex items-center gap-2 text-sm font-black text-emerald-800"><RadioTower className="h-5 w-5" /> Telecom/SIM issue details</div>
          <CardTitle>Build a safe telecom complaint</CardTitle>
          <CardDescription>Enter only needed details. Mask mobile number and never enter OTP, UPI PIN, CVV or passwords.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="telecom-issue-type">Issue type</Label>
              <select id="telecom-issue-type" value={form.issueType} onChange={(event) => update('issueType', event.target.value)} className="min-h-11 w-full rounded-xl border bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                {telecomIssueTypes.map((issue) => <option key={issue.id} value={issue.id}>{issue.label}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="operator-name">Operator name</Label>
              <Input id="operator-name" value={form.operatorName} onChange={(event) => update('operatorName', event.target.value)} placeholder="Jio / Airtel / Vi / BSNL" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="masked-mobile">Masked mobile/account</Label>
              <Input id="masked-mobile" value={form.mobileNumberMasked} onChange={(event) => update('mobileNumberMasked', event.target.value)} placeholder="98******21 or customer ID" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="issue-date">Issue date</Label>
              <Input id="issue-date" type="date" value={form.issueDate} onChange={(event) => update('issueDate', event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="recharge-amount">Recharge amount</Label>
              <Input id="recharge-amount" inputMode="decimal" value={form.rechargeAmount} onChange={(event) => update('rechargeAmount', event.target.value)} placeholder="299" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bill-amount">Bill/extra charge amount</Label>
              <Input id="bill-amount" inputMode="decimal" value={form.billAmount} onChange={(event) => update('billAmount', event.target.value)} placeholder="999" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="transaction-id">Transaction / bill / recharge ID</Label>
              <Input id="transaction-id" value={form.transactionId} onChange={(event) => update('transactionId', event.target.value)} placeholder="UPI ref / recharge ID / bill number" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="complaint-id">Existing complaint ID</Label>
              <Input id="complaint-id" value={form.complaintId} onChange={(event) => update('complaintId', event.target.value)} placeholder="Service request number" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="last-response">Last response from operator</Label>
            <Textarea id="last-response" value={form.lastResponse} onChange={(event) => update('lastResponse', event.target.value)} placeholder="Support said refund will come in 7 days but no update..." />
          </div>
          <div className="space-y-2">
            <Label htmlFor="evidence-available">Evidence available</Label>
            <Textarea id="evidence-available" value={form.evidenceAvailable} onChange={(event) => update('evidenceAvailable', event.target.value)} placeholder="Recharge receipt, SMS, app screenshot, bill PDF, call log..." />
          </div>
          <div className="space-y-2">
            <Label htmlFor="desired-outcome">Desired outcome</Label>
            <Textarea id="desired-outcome" value={form.desiredOutcome} onChange={(event) => update('desiredOutcome', event.target.value)} />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-5">
        <Card className="border-emerald-100 bg-white shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><ClipboardList className="h-5 w-5 text-emerald-700" /> Complaint plan</CardTitle>
            <CardDescription>{plan.summary}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-emerald-50 p-4">
                <div className="text-xs font-black uppercase text-emerald-800">Urgency score</div>
                <div className="mt-1 text-3xl font-black text-emerald-900">{plan.urgencyScore}/100</div>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="text-xs font-black uppercase text-slate-500">Money at risk</div>
                <div className="mt-1 text-3xl font-black text-slate-950">₹{plan.moneyAtRisk}</div>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 p-4 text-sm leading-6 text-slate-700">{plan.urgencyLevel}</div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-emerald-700" /> Proof checklist</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm leading-6 text-slate-700">
              {plan.proofChecklist.map((item) => <li key={item} className="flex gap-2"><CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-700" />{item}</li>)}
            </ul>
          </CardContent>
        </Card>

        <Card className="border-amber-200 bg-amber-50 shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-950"><AlertTriangle className="h-5 w-5" /> Telecom safety</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm leading-6 text-amber-950">
              {plan.safetyWarnings.map((item) => <li key={item}>• {item}</li>)}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card className="lg:col-span-2 border-emerald-100 bg-white shadow-soft">
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Copy-ready telecom complaint</CardTitle>
              <CardDescription>Edit before sending through official operator support only.</CardDescription>
            </div>
            <Button onClick={copyMessage} className="min-h-11 w-full sm:w-auto"><Copy className="mr-2 h-4 w-4" />{copied ? 'Copied' : 'Copy message'}</Button>
          </div>
        </CardHeader>
        <CardContent>
          <pre className="max-h-[30rem] overflow-auto whitespace-pre-wrap rounded-2xl bg-slate-950 p-4 text-sm leading-7 text-slate-50">{plan.copyReadyMessage}</pre>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2 border-slate-200 bg-white shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-emerald-700" /> Escalation route</CardTitle>
          <CardDescription>Keep each step calm, factual and proof-based.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-5">
            {plan.escalationRoute.map((step) => (
              <div key={step.step} className="rounded-2xl border border-slate-200 p-4">
                <div className="text-xs font-black text-emerald-700">{step.step}</div>
                <div className="mt-1 font-black text-slate-950">{step.title}</div>
                <p className="mt-2 text-sm leading-6 text-slate-600">{step.action}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
