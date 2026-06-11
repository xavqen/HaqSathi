"use client"

import { useMemo, useState } from 'react'
import { AlertTriangle, Building2, CheckCircle2, ClipboardList, Copy, FileText, Home, Scale, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { agreementStatuses, buildRentDepositDisputePlan, rentDepositIssueTypes } from '@/lib/productivity/rent-deposit-dispute-planner'

const initialState = {
  issueType: 'deposit_not_returned',
  cityState: '',
  landlordOrBroker: '',
  propertyAddress: '',
  monthlyRent: '',
  depositAmount: '',
  moveInDate: '',
  moveOutDate: '',
  noticeGivenDate: '',
  agreementStatus: 'Written rental agreement available',
  deductionClaim: '',
  pendingAmount: '',
  previousRequestDate: '',
  desiredResolution: 'Please return the pending amount or share a written deduction breakup with proof',
  userNotes: ''
}

export function RentDepositDisputePlannerForm() {
  const [form, setForm] = useState(initialState)
  const [copied, setCopied] = useState(false)
  const plan = useMemo(() => buildRentDepositDisputePlan(form), [form])

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
      <Card>
        <CardHeader>
          <Home className="h-6 w-6 text-emerald-700" />
          <CardTitle>Rent/deposit dispute details</CardTitle>
          <CardDescription>Add agreement, payment and handover details. Do not paste exact private address if you plan to share publicly.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="issueType">Issue type</Label>
              <select id="issueType" value={form.issueType} onChange={(event) => update('issueType', event.target.value)} className="min-h-11 rounded-xl border bg-white px-3 text-sm">
                {rentDepositIssueTypes.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="cityState">City / State</Label>
              <Input id="cityState" value={form.cityState} onChange={(event) => update('cityState', event.target.value)} placeholder="Delhi / Bengaluru / Ranchi" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="landlordOrBroker">Landlord / broker / manager name</Label>
              <Input id="landlordOrBroker" value={form.landlordOrBroker} onChange={(event) => update('landlordOrBroker', event.target.value)} placeholder="Name or role" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="agreementStatus">Agreement status</Label>
              <select id="agreementStatus" value={form.agreementStatus} onChange={(event) => update('agreementStatus', event.target.value)} className="min-h-11 rounded-xl border bg-white px-3 text-sm">
                {agreementStatuses.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </div>
            <div className="grid gap-2 md:col-span-2">
              <Label htmlFor="propertyAddress">Property details</Label>
              <Input id="propertyAddress" value={form.propertyAddress} onChange={(event) => update('propertyAddress', event.target.value)} placeholder="Area/building only. Avoid full address in public copy." />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="monthlyRent">Monthly rent</Label>
              <Input id="monthlyRent" inputMode="decimal" value={form.monthlyRent} onChange={(event) => update('monthlyRent', event.target.value)} placeholder="12000" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="depositAmount">Security deposit</Label>
              <Input id="depositAmount" inputMode="decimal" value={form.depositAmount} onChange={(event) => update('depositAmount', event.target.value)} placeholder="24000" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="moveInDate">Move-in date</Label>
              <Input id="moveInDate" type="date" value={form.moveInDate} onChange={(event) => update('moveInDate', event.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="moveOutDate">Move-out / handover date</Label>
              <Input id="moveOutDate" type="date" value={form.moveOutDate} onChange={(event) => update('moveOutDate', event.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="noticeGivenDate">Notice given date</Label>
              <Input id="noticeGivenDate" type="date" value={form.noticeGivenDate} onChange={(event) => update('noticeGivenDate', event.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="previousRequestDate">Previous written request date</Label>
              <Input id="previousRequestDate" type="date" value={form.previousRequestDate} onChange={(event) => update('previousRequestDate', event.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="pendingAmount">Pending amount / claim</Label>
              <Input id="pendingAmount" inputMode="decimal" value={form.pendingAmount} onChange={(event) => update('pendingAmount', event.target.value)} placeholder="Amount still pending" />
            </div>
            <div className="grid gap-2 md:col-span-2">
              <Label htmlFor="deductionClaim">Deduction / dispute details</Label>
              <Textarea id="deductionClaim" value={form.deductionClaim} onChange={(event) => update('deductionClaim', event.target.value)} placeholder="Example: landlord deducted painting/cleaning without bill, deposit pending since 20 days..." />
            </div>
            <div className="grid gap-2 md:col-span-2">
              <Label htmlFor="desiredResolution">Desired resolution</Label>
              <Textarea id="desiredResolution" value={form.desiredResolution} onChange={(event) => update('desiredResolution', event.target.value)} />
            </div>
            <div className="grid gap-2 md:col-span-2">
              <Label htmlFor="userNotes">Extra notes</Label>
              <Textarea id="userNotes" value={form.userNotes} onChange={(event) => update('userNotes', event.target.value)} placeholder="Add timeline, handover details, promises or pending reply." />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6">
        <Card className="border-emerald-100">
          <CardHeader>
            <Scale className="h-6 w-6 text-emerald-700" />
            <CardTitle>Plan summary</CardTitle>
            <CardDescription>Guidance only. Check local laws and agreement before formal escalation.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl bg-emerald-50 p-4">
              <p className="text-xs font-black uppercase text-emerald-800">Urgency</p>
              <p className="mt-1 text-lg font-black text-slate-950">{plan.urgencyLevel}</p>
              <p className="mt-2 text-sm leading-6 text-slate-700">{plan.summary}</p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-2xl bg-slate-50 p-3"><p className="font-black text-slate-950">Proof score</p><p>{plan.proofStrengthScore}%</p></div>
              <div className="rounded-2xl bg-slate-50 p-3"><p className="font-black text-slate-950">Pending</p><p>₹{plan.pendingAmount ?? '—'}</p></div>
            </div>
            <Button type="button" onClick={copyMessage} className="min-h-12 w-full rounded-xl font-black"><Copy className="mr-2 h-4 w-4" />{copied ? 'Copied' : 'Copy rent dispute message'}</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <AlertTriangle className="h-6 w-6 text-amber-600" />
            <CardTitle>Safety warnings</CardTitle>
            <CardDescription>Avoid privacy, legal and personal safety mistakes.</CardDescription>
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
          <CardDescription>Keep this proof ready before escalation or formal notice.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            {plan.proofChecklist.map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-700"><CheckCircle2 className="mb-2 h-5 w-5 text-emerald-700" />{item}</div>)}
          </div>
        </CardContent>
      </Card>

      <Card className="xl:col-span-2">
        <CardHeader>
          <Building2 className="h-6 w-6 text-emerald-700" />
          <CardTitle>Escalation route</CardTitle>
          <CardDescription>Prefer written, peaceful and evidence-based resolution.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            {plan.escalationPlan.map((item) => (
              <div key={item.step} className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-black text-emerald-800">{item.step}</p>
                <h3 className="mt-1 font-black text-slate-950">{item.target}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-700">{item.action}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="xl:col-span-2">
        <CardHeader>
          <FileText className="h-6 w-6 text-emerald-700" />
          <CardTitle>Copy-ready message</CardTitle>
          <CardDescription>Edit private details before sending. Do not publish exact address or personal IDs.</CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="max-h-[28rem] overflow-auto whitespace-pre-wrap rounded-2xl bg-slate-950 p-4 text-sm leading-6 text-emerald-50">{plan.copyReadyMessage}</pre>
        </CardContent>
      </Card>
    </div>
  )
}
