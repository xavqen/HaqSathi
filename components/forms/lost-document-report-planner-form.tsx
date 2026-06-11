"use client"

import { useMemo, useState } from 'react'
import { AlertTriangle, CheckCircle2, ClipboardList, Copy, FileWarning, FileText, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { buildLostDocumentReportPlan, lostDocumentIssueTypes, lostDocumentTypes } from '@/lib/productivity/lost-document-report-planner'

const initialState = {
  documentType: 'aadhaar',
  lossType: 'lost',
  cityOrState: '',
  lostDate: '',
  placeLost: '',
  documentHolder: '',
  documentNumberHint: '',
  policeReportStatus: '',
  misuseConcern: '',
  desiredOutcome: 'Please share the duplicate/reissue process, missing proof if any, and expected timeline in writing'
}

export function LostDocumentReportPlannerForm() {
  const [form, setForm] = useState(initialState)
  const [copied, setCopied] = useState(false)
  const plan = useMemo(() => buildLostDocumentReportPlan(form), [form])

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
          <div className="flex items-center gap-2 text-sm font-black text-emerald-800"><FileWarning className="h-5 w-5" /> Lost document details</div>
          <CardTitle>Build a lost document report plan</CardTitle>
          <CardDescription>Use this to prepare safe lost-report, duplicate/reissue and misuse-protection steps. Do not paste full ID numbers or secrets.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="lost-document-type">Document type</Label>
              <select id="lost-document-type" value={form.documentType} onChange={(event) => update('documentType', event.target.value)} className="min-h-11 w-full rounded-xl border bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                {lostDocumentTypes.map((document) => <option key={document.id} value={document.id}>{document.label}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="lost-issue-type">Loss type</Label>
              <select id="lost-issue-type" value={form.lossType} onChange={(event) => update('lossType', event.target.value)} className="min-h-11 w-full rounded-xl border bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                {lostDocumentIssueTypes.map((issue) => <option key={issue.id} value={issue.id}>{issue.label}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="lost-city-state">City/state</Label>
              <Input id="lost-city-state" value={form.cityOrState} onChange={(event) => update('cityOrState', event.target.value)} placeholder="Delhi / Ranchi / Mumbai / your city" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lost-date">Date lost</Label>
              <Input id="lost-date" type="date" value={form.lostDate} onChange={(event) => update('lostDate', event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="document-holder">Document holder</Label>
              <Input id="document-holder" value={form.documentHolder} onChange={(event) => update('documentHolder', event.target.value)} placeholder="Self / father / mother / family member" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="document-number-hint">Document number hint only</Label>
              <Input id="document-number-hint" value={form.documentNumberHint} onChange={(event) => update('documentNumberHint', event.target.value)} placeholder="Last 4 digits or masked hint only" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="place-lost">Where/how was it lost?</Label>
            <Textarea id="place-lost" value={form.placeLost} onChange={(event) => update('placeLost', event.target.value)} placeholder="Market, bus/train, school/college, bank, office, wallet/bag/phone lost, approximate time/route..." className="min-h-24" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="police-report-status">Police/lost report status</Label>
            <Textarea id="police-report-status" value={form.policeReportStatus} onChange={(event) => update('policeReportStatus', event.target.value)} placeholder="Not filed yet / e-FIR done / NC report number / local police station visited / affidavit required..." className="min-h-24" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="misuse-concern">Misuse concern or action taken</Label>
            <Textarea id="misuse-concern" value={form.misuseConcern} onChange={(event) => update('misuseConcern', event.target.value)} placeholder="Card/SIM blocked, UPI disabled, suspicious call/transaction, bank informed, cyber complaint, no misuse yet..." className="min-h-24" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lost-outcome">Desired outcome</Label>
            <Textarea id="lost-outcome" value={form.desiredOutcome} onChange={(event) => update('desiredOutcome', event.target.value)} className="min-h-20" />
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
          <CardHeader><CardTitle>Action route</CardTitle><CardDescription>Secure misuse risk first, then use official report and duplicate/reissue channels.</CardDescription></CardHeader>
          <CardContent className="space-y-3">{plan.actionRoute.map((item) => <div key={item.step} className="rounded-2xl border border-slate-200 p-3"><div className="text-xs font-black text-emerald-700">{item.step}</div><div className="font-black text-slate-950">{item.title}</div><p className="text-sm leading-6 text-slate-600">{item.action}</p></div>)}</CardContent>
        </Card>

        <Card className="border-amber-200 bg-amber-50">
          <CardHeader><CardTitle className="flex items-center gap-2 text-amber-950"><AlertTriangle className="h-5 w-5" /> Safety warnings</CardTitle></CardHeader>
          <CardContent><ul className="space-y-2 text-sm leading-6 text-amber-950">{plan.safetyWarnings.map((warning) => <li key={warning}>• {warning}</li>)}</ul></CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-emerald-700" /> Copy-ready lost document message</CardTitle>
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
