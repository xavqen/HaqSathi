'use client'

import { useMemo, useState } from 'react'
import { AlertTriangle, CheckCircle2, ClipboardList, Copy, FileText, ShieldCheck, Wrench } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { buildWarrantyClaimPlan, warrantyClaimProductTypes } from '@/lib/productivity/warranty-claim-planner'

const initialState = {
  productName: '',
  productType: 'mobile',
  brandOrSeller: '',
  purchaseDate: '',
  warrantyEndDate: '',
  invoiceNumber: '',
  issueDate: '',
  issueDescription: '',
  previousServiceVisit: '',
  desiredResolution: 'Repair / replacement as per warranty policy'
}

export function WarrantyClaimPlannerForm() {
  const [form, setForm] = useState(initialState)
  const [copied, setCopied] = useState(false)
  const plan = useMemo(() => buildWarrantyClaimPlan(form), [form])

  function update(field: keyof typeof initialState, value: string) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  async function copyClaim() {
    await navigator.clipboard.writeText(plan.copyReadyClaim)
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
      <Card>
        <CardHeader>
          <Wrench className="h-6 w-6 text-emerald-700" />
          <CardTitle>Warranty claim details</CardTitle>
          <CardDescription>Add product, invoice and issue details. Keep private passwords/OTP/PIN out of this form.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label htmlFor="productName">Product name / model</Label>
              <Input id="productName" value={form.productName} onChange={(e) => update('productName', e.target.value)} placeholder="Example: Redmi Note 12 / HP laptop / washing machine" />
            </div>
            <div>
              <Label htmlFor="productType">Product type</Label>
              <select id="productType" value={form.productType} onChange={(e) => update('productType', e.target.value)} className="mt-2 flex h-12 w-full rounded-2xl border border-input bg-background px-4 py-3 text-base outline-none focus-visible:ring-2 focus-visible:ring-ring">
                {warrantyClaimProductTypes.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
              </select>
            </div>
            <div>
              <Label htmlFor="brandOrSeller">Brand / seller / service center</Label>
              <Input id="brandOrSeller" value={form.brandOrSeller} onChange={(e) => update('brandOrSeller', e.target.value)} placeholder="Brand, marketplace or shop name" />
            </div>
            <div>
              <Label htmlFor="purchaseDate">Purchase date</Label>
              <Input id="purchaseDate" type="date" value={form.purchaseDate} onChange={(e) => update('purchaseDate', e.target.value)} />
            </div>
            <div>
              <Label htmlFor="warrantyEndDate">Warranty end date (optional)</Label>
              <Input id="warrantyEndDate" type="date" value={form.warrantyEndDate} onChange={(e) => update('warrantyEndDate', e.target.value)} />
            </div>
            <div>
              <Label htmlFor="invoiceNumber">Invoice / order / ticket number</Label>
              <Input id="invoiceNumber" value={form.invoiceNumber} onChange={(e) => update('invoiceNumber', e.target.value)} placeholder="Keep it partial if public sharing" />
            </div>
            <div>
              <Label htmlFor="issueDate">Issue noticed date</Label>
              <Input id="issueDate" type="date" value={form.issueDate} onChange={(e) => update('issueDate', e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="issueDescription">Issue description</Label>
              <Textarea id="issueDescription" value={form.issueDescription} onChange={(e) => update('issueDescription', e.target.value)} placeholder="What happened, when, any error, what service center said" rows={5} />
            </div>
            <div>
              <Label htmlFor="previousServiceVisit">Previous service visit / ticket</Label>
              <Textarea id="previousServiceVisit" value={form.previousServiceVisit} onChange={(e) => update('previousServiceVisit', e.target.value)} placeholder="Ticket/job sheet/date/person if any" rows={4} />
            </div>
            <div>
              <Label htmlFor="desiredResolution">Desired resolution</Label>
              <Textarea id="desiredResolution" value={form.desiredResolution} onChange={(e) => update('desiredResolution', e.target.value)} placeholder="Repair, replacement, refund, rework, written diagnosis" rows={4} />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6">
        <Card className="border-emerald-100">
          <CardHeader>
            <ShieldCheck className="h-6 w-6 text-emerald-700" />
            <CardTitle>Claim summary</CardTitle>
            <CardDescription>{plan.summary}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 text-sm">
              <div className="rounded-2xl bg-slate-50 p-4"><strong>Warranty end:</strong> {plan.warrantyEnd}</div>
              <div className="rounded-2xl bg-slate-50 p-4"><strong>Urgency:</strong> {plan.claimUrgency}</div>
              <div className="rounded-2xl bg-slate-50 p-4"><strong>Claim strength:</strong> {plan.claimStrengthScore}/100</div>
              <div className="rounded-2xl bg-slate-50 p-4"><strong>Route:</strong> {plan.route}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <AlertTriangle className="h-6 w-6 text-amber-600" />
            <CardTitle>Safety first</CardTitle>
            <CardDescription>Do not lose private data or fall for fake pickup/service scams.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="grid gap-2 text-sm leading-6 text-slate-700">
              {plan.privacyWarnings.map((item) => <li key={item} className="flex gap-2"><AlertTriangle className="mt-1 h-4 w-4 shrink-0 text-amber-600" />{item}</li>)}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card className="xl:col-span-2">
        <CardHeader>
          <ClipboardList className="h-6 w-6 text-emerald-700" />
          <CardTitle>Proof checklist + service visit questions</CardTitle>
          <CardDescription>Carry these details before visiting or escalating.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 p-4">
              <h3 className="font-black text-slate-950">Proof checklist</h3>
              <ul className="mt-3 grid gap-2 text-sm leading-6 text-slate-700">
                {plan.proofChecklist.map((item) => <li key={item} className="flex gap-2"><CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-700" />{item}</li>)}
              </ul>
            </div>
            <div className="rounded-2xl border border-slate-200 p-4">
              <h3 className="font-black text-slate-950">Ask at service center</h3>
              <ul className="mt-3 grid gap-2 text-sm leading-6 text-slate-700">
                {plan.serviceVisitQuestions.map((item) => <li key={item} className="flex gap-2"><CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-700" />{item}</li>)}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="xl:col-span-2">
        <CardHeader>
          <FileText className="h-6 w-6 text-emerald-700" />
          <CardTitle>Escalation plan</CardTitle>
          <CardDescription>Use written proof at every step.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-5">
            {plan.escalationPlan.map((step) => (
              <div key={step.step} className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-black text-emerald-700">{step.step}</p>
                <h3 className="mt-2 text-sm font-black text-slate-950">{step.target}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{step.action}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="xl:col-span-2">
        <CardHeader>
          <Copy className="h-6 w-6 text-emerald-700" />
          <CardTitle>Copy-ready warranty claim</CardTitle>
          <CardDescription>Edit once, attach proof and send through official support route.</CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="max-h-[420px] overflow-auto whitespace-pre-wrap rounded-2xl bg-slate-950 p-4 text-sm leading-7 text-emerald-50">{plan.copyReadyClaim}</pre>
          <Button onClick={copyClaim} className="mt-4 w-full sm:w-auto"><Copy className="h-4 w-4" /> {copied ? 'Copied' : 'Copy warranty claim'}</Button>
        </CardContent>
      </Card>
    </div>
  )
}
