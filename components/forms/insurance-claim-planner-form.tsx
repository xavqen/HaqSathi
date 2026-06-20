'use client'

import { useMemo, useState } from 'react'
import { AlertTriangle, CheckCircle2, ClipboardList, Copy, FileText, ShieldCheck, Umbrella } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { buildInsuranceClaimPlan, insuranceClaimTypes } from '@/lib/productivity/insurance-claim-planner'

const initialState = {
  claimType: 'vehicle',
  insurerName: '',
  policyNumber: '',
  claimAmount: '',
  incidentDate: '',
  policyStartDate: '',
  policyEndDate: '',
  claimSubmittedDate: '',
  cityState: '',
  incidentSummary: '',
  rejectionReason: '',
  desiredOutcome: 'Please share claim status, pending document list and expected resolution date',
  userNotes: ''
}

export function InsuranceClaimPlannerForm() {
  const [form, setForm] = useState(initialState)
  const [copied, setCopied] = useState(false)
  const plan = useMemo(() => buildInsuranceClaimPlan(form), [form])

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
          <Umbrella className="h-7 w-7 text-emerald-700" />
          <CardTitle>Insurance claim details</CardTitle>
          <CardDescription>Fill only safe details. Do not enter OTP, passwords, CVV, full policy scan text, full medical records or bank secrets.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="claimType">Claim type</Label>
              <select
                id="claimType"
                value={form.claimType}
                onChange={(event) => update('claimType', event.target.value)}
                className="min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {insuranceClaimTypes.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="insurerName">Insurer / TPA name</Label>
              <Input id="insurerName" value={form.insurerName} onChange={(event) => update('insurerName', event.target.value)} placeholder="Example: ABC Insurance / TPA" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="policyNumber">Policy / claim reference</Label>
              <Input id="policyNumber" value={form.policyNumber} onChange={(event) => update('policyNumber', event.target.value)} placeholder="Use partial/masked ID if sharing publicly" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="claimAmount">Claim amount</Label>
              <Input id="claimAmount" value={form.claimAmount} onChange={(event) => update('claimAmount', event.target.value)} placeholder="Example: 25000" inputMode="decimal" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cityState">City / State</Label>
              <Input id="cityState" value={form.cityState} onChange={(event) => update('cityState', event.target.value)} placeholder="Example: Patna, Bihar" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="incidentDate">Incident / hospitalization / loss date</Label>
              <Input id="incidentDate" type="date" value={form.incidentDate} onChange={(event) => update('incidentDate', event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="claimSubmittedDate">Claim submitted date</Label>
              <Input id="claimSubmittedDate" type="date" value={form.claimSubmittedDate} onChange={(event) => update('claimSubmittedDate', event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="policyStartDate">Policy start date</Label>
              <Input id="policyStartDate" type="date" value={form.policyStartDate} onChange={(event) => update('policyStartDate', event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="policyEndDate">Policy end date</Label>
              <Input id="policyEndDate" type="date" value={form.policyEndDate} onChange={(event) => update('policyEndDate', event.target.value)} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="incidentSummary">Incident / claim summary</Label>
              <Textarea id="incidentSummary" value={form.incidentSummary} onChange={(event) => update('incidentSummary', event.target.value)} placeholder="What happened? What did insurer/TPA say? Keep it short and factual." rows={4} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="rejectionReason">Delay / rejection / short-settlement reason</Label>
              <Textarea id="rejectionReason" value={form.rejectionReason} onChange={(event) => update('rejectionReason', event.target.value)} placeholder="Example: missing document, pre-existing condition, survey pending, invoice mismatch, claim not admissible..." rows={3} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="desiredOutcome">Desired outcome</Label>
              <Input id="desiredOutcome" value={form.desiredOutcome} onChange={(event) => update('desiredOutcome', event.target.value)} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="userNotes">Extra notes</Label>
              <Textarea id="userNotes" value={form.userNotes} onChange={(event) => update('userNotes', event.target.value)} placeholder="Any claim ID, previous email date, survey status, branch visit, etc. Do not add secrets." rows={3} />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6">
        <Card className="border-emerald-100">
          <CardHeader>
            <ShieldCheck className="h-7 w-7 text-emerald-700" />
            <CardTitle>Claim plan</CardTitle>
            <CardDescription>Use this as a safe checklist before contacting insurer/TPA or grievance desk.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl bg-emerald-50 p-4">
              <p className="text-xs font-black uppercase tracking-wide text-emerald-800">Urgency</p>
              <p className="mt-1 text-xl font-black text-slate-950">{plan.urgencyLevel}</p>
              <p className="mt-2 text-sm leading-6 text-slate-700">{plan.summary}</p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="rounded-2xl border border-slate-200 bg-white p-3">
                <p className="text-2xl font-black text-slate-950">{plan.proofStrengthScore}%</p>
                <p className="text-xs font-bold text-slate-500">Proof strength</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-3">
                <p className="text-2xl font-black text-slate-950">{plan.submittedAgeDays ?? '—'}</p>
                <p className="text-xs font-bold text-slate-500">Days since submitted</p>
              </div>
            </div>
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <div className="flex gap-2 text-sm font-black text-amber-900"><AlertTriangle className="h-5 w-5 shrink-0" />Secret safety</div>
              <p className="mt-2 text-sm leading-6 text-amber-900">Never share OTP, UPI PIN, CVV, net-banking password, remote screen access or full public medical/ID details for claim settlement.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="xl:col-span-2">
        <CardHeader>
          <ClipboardList className="h-7 w-7 text-emerald-700" />
          <CardTitle>Proof checklist</CardTitle>
          <CardDescription>Collect these before escalation.</CardDescription>
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
          <FileText className="h-7 w-7 text-emerald-700" />
          <CardTitle>Copy-ready insurance claim message</CardTitle>
          <CardDescription>Send through official insurer/TPA channel after checking facts.</CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="max-h-[420px] overflow-auto whitespace-pre-wrap rounded-2xl bg-slate-950 p-4 text-sm leading-7 text-emerald-50">{plan.copyReadyMessage}</pre>
          <Button type="button" onClick={copyMessage} className="mt-4 min-h-12 w-full rounded-2xl font-black sm:w-auto">
            <Copy className="mr-2 h-4 w-4" /> {copied ? 'Copied' : 'Copy insurance claim message'}
          </Button>
        </CardContent>
      </Card>

      <Card className="xl:col-span-2">
        <CardHeader>
          <ShieldCheck className="h-7 w-7 text-emerald-700" />
          <CardTitle>Escalation route + safety warnings</CardTitle>
          <CardDescription>Stay factual, official-channel only, and privacy-safe.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="grid gap-3">
              {plan.escalationPlan.map((step) => (
                <div key={step.step} className="rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-xs font-black text-emerald-700">{step.step} · {step.target}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-700">{step.action}</p>
                </div>
              ))}
            </div>
            <div className="grid gap-3">
              {plan.safetyWarnings.map((warning) => (
                <div key={warning} className="flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
                  <AlertTriangle className="mt-1 h-4 w-4 shrink-0" />
                  <span>{warning}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
