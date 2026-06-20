
"use client"

import { useMemo, useState } from 'react'
import { AlertTriangle, BriefcaseBusiness, CheckCircle2, ClipboardList, Copy, FileText, ShieldAlert, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { buildJobSalaryDisputePlan, jobSalaryIssueTypes } from '@/lib/productivity/job-salary-dispute-planner'

const initialState = {
  issueType: 'unpaid-salary',
  employerOrCompany: '',
  roleOrJobTitle: '',
  promisedAmount: '',
  paidAmount: '',
  joiningDate: '',
  lastWorkDate: '',
  salaryDueDate: '',
  location: '',
  communicationChannel: '',
  issueSummary: '',
  evidenceAvailable: '',
  desiredOutcome: 'Please share written payment/status update, pending amount breakup and expected resolution date',
  extraNotes: ''
}

export function JobSalaryDisputePlannerForm() {
  const [form, setForm] = useState(initialState)
  const [copied, setCopied] = useState(false)
  const plan = useMemo(() => buildJobSalaryDisputePlan(form), [form])

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
          <BriefcaseBusiness className="h-7 w-7 text-emerald-700" />
          <CardTitle>Job / salary issue details</CardTitle>
          <CardDescription>Fill safe, factual details only. Do not enter OTP, UPI PIN, passwords, CVV, full Aadhaar/PAN, full bank details or private documents.</CardDescription>
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
                {jobSalaryIssueTypes.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="employerOrCompany">Employer / company / client</Label>
              <Input id="employerOrCompany" value={form.employerOrCompany} onChange={(event) => update('employerOrCompany', event.target.value)} placeholder="Example: Company name / client name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="roleOrJobTitle">Role / job title / project</Label>
              <Input id="roleOrJobTitle" value={form.roleOrJobTitle} onChange={(event) => update('roleOrJobTitle', event.target.value)} placeholder="Example: Sales executive / web project" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="promisedAmount">Promised amount</Label>
              <Input id="promisedAmount" value={form.promisedAmount} onChange={(event) => update('promisedAmount', event.target.value)} placeholder="Example: 18000" inputMode="decimal" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="paidAmount">Paid amount</Label>
              <Input id="paidAmount" value={form.paidAmount} onChange={(event) => update('paidAmount', event.target.value)} placeholder="Example: 5000" inputMode="decimal" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="joiningDate">Joining / work start date</Label>
              <Input id="joiningDate" type="date" value={form.joiningDate} onChange={(event) => update('joiningDate', event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastWorkDate">Last work date</Label>
              <Input id="lastWorkDate" type="date" value={form.lastWorkDate} onChange={(event) => update('lastWorkDate', event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="salaryDueDate">Salary/payment due date</Label>
              <Input id="salaryDueDate" type="date" value={form.salaryDueDate} onChange={(event) => update('salaryDueDate', event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">City / State</Label>
              <Input id="location" value={form.location} onChange={(event) => update('location', event.target.value)} placeholder="Example: Bokaro, Jharkhand" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="communicationChannel">Communication channel</Label>
              <Input id="communicationChannel" value={form.communicationChannel} onChange={(event) => update('communicationChannel', event.target.value)} placeholder="Email, WhatsApp, HR portal, client chat, phone call..." />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="issueSummary">What happened?</Label>
              <Textarea id="issueSummary" value={form.issueSummary} onChange={(event) => update('issueSummary', event.target.value)} placeholder="Write salary delay, deduction, fake job fee, fake offer, freelance payment issue, or HR/client promise in short factual words." rows={4} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="evidenceAvailable">Evidence available</Label>
              <Textarea id="evidenceAvailable" value={form.evidenceAvailable} onChange={(event) => update('evidenceAvailable', event.target.value)} placeholder="Offer letter, appointment letter, salary slip, bank proof, attendance, screenshots, invoice, chats..." rows={3} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="desiredOutcome">Desired outcome</Label>
              <Input id="desiredOutcome" value={form.desiredOutcome} onChange={(event) => update('desiredOutcome', event.target.value)} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="extraNotes">Extra notes</Label>
              <Textarea id="extraNotes" value={form.extraNotes} onChange={(event) => update('extraNotes', event.target.value)} placeholder="Any HR ticket ID, invoice number, latest promise date, recruiter details, or previous follow-up." rows={3} />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6">
        <Card className="border-emerald-100">
          <CardHeader>
            <ShieldCheck className="h-7 w-7 text-emerald-700" />
            <CardTitle>Action plan</CardTitle>
            <CardDescription>Use this before sending HR/client/recruiter follow-up.</CardDescription>
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
                <p className="text-2xl font-black text-slate-950">₹{plan.pendingAmount}</p>
                <p className="text-xs font-bold text-slate-500">Pending estimate</p>
              </div>
            </div>
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <div className="flex gap-2 text-sm font-black text-amber-950"><ShieldAlert className="h-5 w-5 shrink-0" />Job scam warning</div>
              <p className="mt-2 text-sm leading-6 text-amber-950">Real employers generally do not ask for OTP, UPI PIN, security fee, training fee, kit fee or screen sharing for a job. Verify through official company channels.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="xl:col-span-2">
        <CardHeader>
          <ClipboardList className="h-7 w-7 text-emerald-700" />
          <CardTitle>Proof checklist</CardTitle>
          <CardDescription>Collect these before escalating or posting publicly.</CardDescription>
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
          <CardDescription>Read before paying fees, sending documents or sharing proof.</CardDescription>
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
          <CardTitle>Copy-ready salary/job issue message</CardTitle>
          <CardDescription>Use through official HR/client/recruiter/company channels after checking facts.</CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="max-h-[420px] overflow-auto whitespace-pre-wrap rounded-2xl bg-slate-950 p-4 text-sm leading-7 text-emerald-50">{plan.copyReadyMessage}</pre>
          <Button type="button" onClick={copyMessage} className="mt-4 min-h-12 w-full rounded-2xl font-black sm:w-auto">
            <Copy className="mr-2 h-4 w-4" /> {copied ? 'Copied' : 'Copy job/salary message'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
