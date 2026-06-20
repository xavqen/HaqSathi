"use client"

import { useMemo, useState } from 'react'
import { AlertTriangle, CheckCircle2, ClipboardList, Copy, FileText, IdCard, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { buildIdentityDocumentCorrectionPlan, identityCorrectionTypes, identityDocumentTypes } from '@/lib/productivity/identity-document-correction-planner'

const initialState = {
  documentType: 'aadhaar',
  correctionType: 'name-spelling',
  currentValue: '',
  correctValue: '',
  stateOrAuthority: '',
  applicationNumber: '',
  deadlineDate: '',
  proofAvailable: '',
  submissionStatus: '',
  desiredOutcome: 'Please verify the proof documents and update/correct the record or share the exact missing requirement in writing'
}

export function IdentityDocumentCorrectionPlannerForm() {
  const [form, setForm] = useState(initialState)
  const [copied, setCopied] = useState(false)
  const plan = useMemo(() => buildIdentityDocumentCorrectionPlan(form), [form])

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
          <div className="flex items-center gap-2 text-sm font-black text-emerald-800"><IdCard className="h-5 w-5" /> Identity correction details</div>
          <CardTitle>Build an official correction plan</CardTitle>
          <CardDescription>Use official document details only. Do not paste OTP, passwords, full ID numbers, CVV, UPI PIN or private QR/barcodes.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="identity-document-type">Document type</Label>
              <select id="identity-document-type" value={form.documentType} onChange={(event) => update('documentType', event.target.value)} className="min-h-11 w-full rounded-xl border border-input bg-white px-3 text-sm">
                {identityDocumentTypes.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="identity-correction-type">Correction type</Label>
              <select id="identity-correction-type" value={form.correctionType} onChange={(event) => update('correctionType', event.target.value)} className="min-h-11 w-full rounded-xl border border-input bg-white px-3 text-sm">
                {identityCorrectionTypes.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="current-value">Current wrong value</Label>
              <Input id="current-value" value={form.currentValue} onChange={(event) => update('currentValue', event.target.value)} placeholder="Example: current spelling/date/address" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="correct-value">Correct value requested</Label>
              <Input id="correct-value" value={form.correctValue} onChange={(event) => update('correctValue', event.target.value)} placeholder="Exact value as per proof" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state-authority">State / authority / office</Label>
              <Input id="state-authority" value={form.stateOrAuthority} onChange={(event) => update('stateOrAuthority', event.target.value)} placeholder="UIDAI, PAN, passport office, bank branch, state portal..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="application-number">Application / reference number</Label>
              <Input id="application-number" value={form.applicationNumber} onChange={(event) => update('applicationNumber', event.target.value)} placeholder="Reference ID if available" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="required-by-date">Required by / deadline date</Label>
              <Input id="required-by-date" type="date" value={form.deadlineDate} onChange={(event) => update('deadlineDate', event.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="identity-proof-available">Proof available</Label>
            <Textarea id="identity-proof-available" value={form.proofAvailable} onChange={(event) => update('proofAvailable', event.target.value)} placeholder="Birth certificate, school record, passport, Aadhaar, PAN, address proof, bank KYC acknowledgement, rejection screenshot..." className="min-h-24" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="identity-submission-status">Submission / status details</Label>
            <Textarea id="identity-submission-status" value={form.submissionStatus} onChange={(event) => update('submissionStatus', event.target.value)} placeholder="Not submitted, submitted but pending, rejected, payment done, appointment booked, correction centre visited..." className="min-h-24" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="identity-desired-outcome">Desired outcome</Label>
            <Textarea id="identity-desired-outcome" value={form.desiredOutcome} onChange={(event) => update('desiredOutcome', event.target.value)} className="min-h-20" />
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
          <CardHeader><CardTitle>Official route</CardTitle><CardDescription>Use the issuing authority route only.</CardDescription></CardHeader>
          <CardContent className="space-y-3">{plan.officialRoute.map((item) => <div key={item.step} className="rounded-2xl border border-slate-200 p-3"><div className="text-xs font-black text-emerald-700">{item.step}</div><div className="font-black text-slate-950">{item.title}</div><p className="text-sm leading-6 text-slate-600">{item.action}</p></div>)}</CardContent>
        </Card>

        <Card className="border-amber-200 bg-amber-50">
          <CardHeader><CardTitle className="flex items-center gap-2 text-amber-950"><AlertTriangle className="h-5 w-5" /> Safety warnings</CardTitle></CardHeader>
          <CardContent><ul className="space-y-2 text-sm leading-6 text-amber-950">{plan.safetyWarnings.map((warning) => <li key={warning}>• {warning}</li>)}</ul></CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-emerald-700" /> Copy-ready correction request</CardTitle>
            <CardDescription>Review and edit before submitting through an official portal, office, branch or helpdesk.</CardDescription>
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
