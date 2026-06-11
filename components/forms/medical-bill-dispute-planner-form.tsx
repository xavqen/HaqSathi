"use client"

import { useMemo, useState } from 'react'
import { AlertTriangle, CheckCircle2, ClipboardList, Copy, FileText, Hospital, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { buildMedicalBillDisputePlan, medicalBillIssueTypes, medicalProviderTypes } from '@/lib/productivity/medical-bill-dispute-planner'

const initialState = {
  providerType: 'hospital',
  issueType: 'Overcharged compared to estimate/package',
  providerName: '',
  patientName: '',
  billNumber: '',
  serviceDate: '',
  billDate: '',
  totalBillAmount: '',
  amountPaid: '',
  disputedAmount: '',
  insuranceOrTpa: '',
  estimateOrPackage: '',
  providerResponse: '',
  evidenceAvailable: '',
  desiredOutcome: 'Please provide item-wise billing breakup, correction/refund if applicable, and expected resolution timeline in writing'
}

export function MedicalBillDisputePlannerForm() {
  const [form, setForm] = useState(initialState)
  const [copied, setCopied] = useState(false)
  const plan = useMemo(() => buildMedicalBillDisputePlan(form), [form])

  function update(field: keyof typeof initialState, value: string) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  async function copyMessage() {
    await navigator.clipboard.writeText(plan.copyReadyMessage)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
      <Card className="border-emerald-100">
        <CardHeader>
          <Hospital className="h-7 w-7 text-emerald-700" />
          <CardTitle>Medical bill dispute details</CardTitle>
          <CardDescription>Enter billing facts only. Do not enter OTP, CVV, UPI PIN, password, full health ID, full policy number or full bank details.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="providerType">Provider type</Label>
              <select id="providerType" value={form.providerType} onChange={(event) => update('providerType', event.target.value)} className="min-h-11 rounded-xl border border-input bg-white px-3 text-sm font-semibold text-slate-800">
                {medicalProviderTypes.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="issueType">Issue type</Label>
              <select id="issueType" value={form.issueType} onChange={(event) => update('issueType', event.target.value)} className="min-h-11 rounded-xl border border-input bg-white px-3 text-sm font-semibold text-slate-800">
                {medicalBillIssueTypes.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </div>
            <div className="grid gap-2"><Label htmlFor="providerName">Hospital / provider / insurer</Label><Input id="providerName" value={form.providerName} onChange={(event) => update('providerName', event.target.value)} placeholder="Example: hospital, lab, pharmacy, insurer" /></div>
            <div className="grid gap-2"><Label htmlFor="patientName">Patient/name on bill</Label><Input id="patientName" value={form.patientName} onChange={(event) => update('patientName', event.target.value)} placeholder="Name on bill or claim" /></div>
            <div className="grid gap-2"><Label htmlFor="billNumber">Bill / receipt / claim number</Label><Input id="billNumber" value={form.billNumber} onChange={(event) => update('billNumber', event.target.value)} placeholder="Bill, receipt, claim or pre-auth ID" /></div>
            <div className="grid gap-2"><Label htmlFor="serviceDate">Service / admission / test date</Label><Input id="serviceDate" type="date" value={form.serviceDate} onChange={(event) => update('serviceDate', event.target.value)} /></div>
            <div className="grid gap-2"><Label htmlFor="billDate">Bill date</Label><Input id="billDate" type="date" value={form.billDate} onChange={(event) => update('billDate', event.target.value)} /></div>
            <div className="grid gap-2"><Label htmlFor="totalBillAmount">Total bill amount</Label><Input id="totalBillAmount" inputMode="decimal" value={form.totalBillAmount} onChange={(event) => update('totalBillAmount', event.target.value)} placeholder="Example: 18500" /></div>
            <div className="grid gap-2"><Label htmlFor="amountPaid">Amount paid</Label><Input id="amountPaid" inputMode="decimal" value={form.amountPaid} onChange={(event) => update('amountPaid', event.target.value)} placeholder="Example: 10000" /></div>
            <div className="grid gap-2"><Label htmlFor="disputedAmount">Disputed / unclear amount</Label><Input id="disputedAmount" inputMode="decimal" value={form.disputedAmount} onChange={(event) => update('disputedAmount', event.target.value)} placeholder="Leave blank to estimate" /></div>
            <div className="grid gap-2 md:col-span-2"><Label htmlFor="insuranceOrTpa">Insurance / TPA details</Label><Textarea id="insuranceOrTpa" value={form.insuranceOrTpa} onChange={(event) => update('insuranceOrTpa', event.target.value)} placeholder="Insurer/TPA name, claim/pre-auth status, denial/deduction reason if any" /></div>
            <div className="grid gap-2 md:col-span-2"><Label htmlFor="estimateOrPackage">Estimate / package / promised billing details</Label><Textarea id="estimateOrPackage" value={form.estimateOrPackage} onChange={(event) => update('estimateOrPackage', event.target.value)} placeholder="Original estimate, package inclusion, quote, rate card or promised amount" /></div>
            <div className="grid gap-2 md:col-span-2"><Label htmlFor="providerResponse">Provider response so far</Label><Textarea id="providerResponse" value={form.providerResponse} onChange={(event) => update('providerResponse', event.target.value)} placeholder="Billing desk, hospital, insurer, TPA, pharmacy or lab response" /></div>
            <div className="grid gap-2 md:col-span-2"><Label htmlFor="evidenceAvailable">Evidence available</Label><Textarea id="evidenceAvailable" value={form.evidenceAvailable} onChange={(event) => update('evidenceAvailable', event.target.value)} placeholder="Final bill, estimate, payment receipt, discharge/test proof, prescription, TPA/insurer emails" /></div>
            <div className="grid gap-2 md:col-span-2"><Label htmlFor="desiredOutcome">Desired outcome</Label><Textarea id="desiredOutcome" value={form.desiredOutcome} onChange={(event) => update('desiredOutcome', event.target.value)} /></div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6">
        <Card className="border-emerald-100 bg-white">
          <CardHeader>
            <ShieldCheck className="h-7 w-7 text-emerald-700" />
            <CardTitle>Billing dispute plan</CardTitle>
            <CardDescription>{plan.summary}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-black uppercase tracking-wide text-slate-500">Urgency score</p>
                <p className="mt-1 text-3xl font-black text-slate-950">{plan.urgencyScore}/100</p>
                <p className="mt-1 text-sm font-semibold text-slate-700">{plan.urgencyLevel}</p>
                <p className="mt-1 text-xs font-bold text-slate-500">Disputed: ₹{plan.disputedAmount} · Bill age: {plan.billAge ?? 'not known'} days</p>
              </div>
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
                <div className="flex gap-2 font-black"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> Health + billing safety</div>
                <p className="mt-1">This is billing guidance only. For urgent health risk, prioritize medical care. Never share OTP, CVV, UPI PIN, password or full policy/bank details.</p>
              </div>
              <Button onClick={copyMessage} className="min-h-12 w-full rounded-xl font-black"><Copy className="mr-2 h-4 w-4" /> {copied ? 'Copied billing message' : 'Copy billing message'}</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="xl:col-span-2">
        <CardHeader>
          <ClipboardList className="h-7 w-7 text-emerald-700" />
          <CardTitle>Proof checklist + escalation route</CardTitle>
          <CardDescription>Prepare a clean proof pack before escalating a hospital, lab, pharmacy or insurance billing issue.</CardDescription>
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
          <FileText className="h-7 w-7 text-emerald-700" />
          <CardTitle>Copy-ready medical billing request</CardTitle>
          <CardDescription>Review details and attach redacted bill, payment, estimate and insurance/TPA proof before sending.</CardDescription>
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
