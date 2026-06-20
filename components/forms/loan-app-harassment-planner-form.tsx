"use client"

import { useMemo, useState } from 'react'
import { AlertTriangle, CheckCircle2, ClipboardList, Copy, FileText, PhoneCall, ShieldAlert, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { buildLoanAppHarassmentPlan, loanAppIssueTypes } from '@/lib/productivity/loan-app-harassment-planner'

const initialState = {
  issueType: 'harassment-calls',
  appOrLenderName: '',
  amountBorrowed: '',
  amountDemanded: '',
  dueDate: '',
  firstHarassmentDate: '',
  contactMethod: '',
  cityState: '',
  harassmentSummary: '',
  evidenceAvailable: '',
  desiredOutcome: 'Please stop harassment, share written amount breakup, update payment status and communicate only through lawful official channels',
  extraNotes: ''
}

export function LoanAppHarassmentPlannerForm() {
  const [form, setForm] = useState(initialState)
  const [copied, setCopied] = useState(false)
  const plan = useMemo(() => buildLoanAppHarassmentPlan(form), [form])

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
          <PhoneCall className="h-7 w-7 text-emerald-700" />
          <CardTitle>Loan app issue details</CardTitle>
          <CardDescription>Fill only safe details. Do not enter OTP, UPI PIN, passwords, CVV, Aadhaar/PAN numbers, full family contacts or private images.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="issueType">Issue type</Label>
              <select
                id="issueType"
                value={form.issueType}
                onChange={(event) => update('issueType', event.target.value)}
                className="min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {loanAppIssueTypes.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="appOrLenderName">Loan app / lender name</Label>
              <Input id="appOrLenderName" value={form.appOrLenderName} onChange={(event) => update('appOrLenderName', event.target.value)} placeholder="Example: App name / lender name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactMethod">Harassment channel</Label>
              <Input id="contactMethod" value={form.contactMethod} onChange={(event) => update('contactMethod', event.target.value)} placeholder="Calls, WhatsApp, SMS, family contacts..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amountBorrowed">Amount borrowed</Label>
              <Input id="amountBorrowed" value={form.amountBorrowed} onChange={(event) => update('amountBorrowed', event.target.value)} placeholder="Example: 5000" inputMode="decimal" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amountDemanded">Amount demanded</Label>
              <Input id="amountDemanded" value={form.amountDemanded} onChange={(event) => update('amountDemanded', event.target.value)} placeholder="Example: 9000" inputMode="decimal" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due date</Label>
              <Input id="dueDate" type="date" value={form.dueDate} onChange={(event) => update('dueDate', event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="firstHarassmentDate">First harassment date</Label>
              <Input id="firstHarassmentDate" type="date" value={form.firstHarassmentDate} onChange={(event) => update('firstHarassmentDate', event.target.value)} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="cityState">City / State</Label>
              <Input id="cityState" value={form.cityState} onChange={(event) => update('cityState', event.target.value)} placeholder="Example: Ranchi, Jharkhand" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="harassmentSummary">What happened?</Label>
              <Textarea id="harassmentSummary" value={form.harassmentSummary} onChange={(event) => update('harassmentSummary', event.target.value)} placeholder="Write calls/messages/threats/fake legal warning/contact list misuse in short factual words. Do not add secrets." rows={4} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="evidenceAvailable">Evidence available</Label>
              <Textarea id="evidenceAvailable" value={form.evidenceAvailable} onChange={(event) => update('evidenceAvailable', event.target.value)} placeholder="Example: call logs, screenshots, payment receipt, app permission screenshot..." rows={3} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="desiredOutcome">Desired outcome</Label>
              <Input id="desiredOutcome" value={form.desiredOutcome} onChange={(event) => update('desiredOutcome', event.target.value)} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="extraNotes">Extra notes</Label>
              <Textarea id="extraNotes" value={form.extraNotes} onChange={(event) => update('extraNotes', event.target.value)} placeholder="Any previous payment, support email, latest threat time, etc. Keep it safe and factual." rows={3} />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6">
        <Card className="border-emerald-100">
          <CardHeader>
            <ShieldCheck className="h-7 w-7 text-emerald-700" />
            <CardTitle>Safety plan</CardTitle>
            <CardDescription>Use this before replying, blocking or filing through official channels.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl bg-emerald-50 p-4">
              <p className="text-xs font-black uppercase tracking-wide text-emerald-800">Urgency</p>
              <p className="mt-1 text-xl font-black text-slate-950">{plan.urgencyLevel}</p>
              <p className="mt-2 text-sm leading-6 text-slate-700">{plan.summary}</p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="rounded-2xl border border-slate-200 bg-white p-3">
                <p className="text-2xl font-black text-slate-950">{plan.riskScore}%</p>
                <p className="text-xs font-bold text-slate-500">Risk score</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-3">
                <p className="text-2xl font-black text-slate-950">₹{plan.overDemand}</p>
                <p className="text-xs font-bold text-slate-500">Extra demanded</p>
              </div>
            </div>
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
              <div className="flex gap-2 text-sm font-black text-red-900"><ShieldAlert className="h-5 w-5 shrink-0" />Immediate safety</div>
              <p className="mt-2 text-sm leading-6 text-red-900">If there are threats, blackmail, family harassment or pressure to self-harm, contact trusted people and official emergency/local authority channels immediately.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="xl:col-span-2">
        <CardHeader>
          <ClipboardList className="h-7 w-7 text-emerald-700" />
          <CardTitle>Proof checklist</CardTitle>
          <CardDescription>Preserve these before filing or escalating.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            {plan.proofChecklist.map((item) => (
              <div key={item} className="flex gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-700">
                <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-700" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="xl:col-span-2">
        <CardHeader>
          <AlertTriangle className="h-7 w-7 text-amber-600" />
          <CardTitle>Safety warnings</CardTitle>
          <CardDescription>Read before sharing or copying any complaint message.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            {plan.safetyWarnings.map((item) => (
              <div key={item} className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">{item}</div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="xl:col-span-2">
        <CardHeader>
          <FileText className="h-7 w-7 text-emerald-700" />
          <CardTitle>Copy-ready loan app harassment message</CardTitle>
          <CardDescription>Use only through official app/lender/email/grievance channel after checking facts.</CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="max-h-[420px] overflow-auto whitespace-pre-wrap rounded-2xl bg-slate-950 p-4 text-sm leading-7 text-emerald-50">{plan.copyReadyMessage}</pre>
          <Button type="button" onClick={copyMessage} className="mt-4 min-h-12 w-full rounded-2xl font-black sm:w-auto">
            <Copy className="mr-2 h-4 w-4" /> {copied ? 'Copied' : 'Copy loan app message'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
