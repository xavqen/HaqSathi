'use client'

import { useMemo, useState } from 'react'
import { AlertTriangle, CheckCircle2, Copy, FileArchive, FolderTree, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { buildProofFileOrganizerPlan, proofIssueTypes } from '@/lib/productivity/proof-file-organizer'

function today() {
  return new Date().toISOString().slice(0, 10)
}

function urgencyClass(urgency: string) {
  if (urgency === 'HIGH') return 'border-rose-200 bg-rose-50 text-rose-800'
  if (urgency === 'NORMAL') return 'border-amber-200 bg-amber-50 text-amber-800'
  return 'border-emerald-200 bg-emerald-50 text-emerald-800'
}

export function ProofFileOrganizerForm() {
  const [caseTitle, setCaseTitle] = useState('Refund pending after online order')
  const [issueType, setIssueType] = useState('refund')
  const [authorityOrCompany, setAuthorityOrCompany] = useState('Example Store')
  const [referenceId, setReferenceId] = useState('ORDER-12345')
  const [incidentDate, setIncidentDate] = useState(today())
  const [proofNotes, setProofNotes] = useState('I have order invoice, payment screenshot and chat screenshot, but no written refund date yet.')
  const [submitted, setSubmitted] = useState(true)
  const [copied, setCopied] = useState(false)

  const plan = useMemo(() => buildProofFileOrganizerPlan({ caseTitle, issueType, authorityOrCompany, referenceId, incidentDate, proofNotes }), [caseTitle, issueType, authorityOrCompany, referenceId, incidentDate, proofNotes])

  const copyIndex = async () => {
    await navigator.clipboard?.writeText(plan.copyReadyIndex)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1600)
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      <Card>
        <CardHeader>
          <FileArchive className="h-7 w-7 text-emerald-700" />
          <CardTitle>Build proof folder plan</CardTitle>
          <CardDescription>Organize screenshots, invoices, receipts, chats and acknowledgements into a clean submission pack.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="proof-case-title">Case title</Label>
              <Input id="proof-case-title" value={caseTitle} onChange={(event) => { setCaseTitle(event.target.value); setSubmitted(false) }} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="proof-issue-type">Issue type</Label>
              <select id="proof-issue-type" value={issueType} onChange={(event) => { setIssueType(event.target.value); setSubmitted(false) }} className="min-h-12 w-full rounded-2xl border border-input bg-background px-4 py-3 text-base outline-none focus-visible:ring-2 focus-visible:ring-ring">
                {proofIssueTypes.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="proof-company">Company / authority</Label>
              <Input id="proof-company" value={authorityOrCompany} onChange={(event) => { setAuthorityOrCompany(event.target.value); setSubmitted(false) }} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="proof-reference">Reference / complaint ID</Label>
              <Input id="proof-reference" value={referenceId} onChange={(event) => { setReferenceId(event.target.value); setSubmitted(false) }} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="proof-date">Incident / purchase / application date</Label>
              <Input id="proof-date" type="date" value={incidentDate} onChange={(event) => { setIncidentDate(event.target.value); setSubmitted(false) }} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="proof-notes">Proof you already have</Label>
            <Textarea id="proof-notes" value={proofNotes} onChange={(event) => { setProofNotes(event.target.value); setSubmitted(false) }} />
          </div>
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
            <div className="flex gap-2 font-black"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> Privacy note</div>
            <p className="mt-1">Do not paste OTP, passwords, UPI PIN, CVV, full card/bank details, full Aadhaar/PAN or private document text. This tool only creates a safe organization plan.</p>
          </div>
          <Button type="button" size="lg" onClick={() => setSubmitted(true)} className="w-full sm:w-auto">Create proof organizer</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <ShieldCheck className="h-7 w-7 text-emerald-700" />
          <CardTitle>Why it helps</CardTitle>
          <CardDescription>Most complaints become weak because proof is scattered, wrongly named or unsafe to share.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="grid gap-2 text-sm leading-6 text-slate-700">
            <li className="flex gap-2"><CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-700" />Creates a clear folder structure.</li>
            <li className="flex gap-2"><CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-700" />Suggests safe file names and order.</li>
            <li className="flex gap-2"><CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-700" />Highlights missing important proof.</li>
          </ul>
        </CardContent>
      </Card>

      {submitted ? (
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex flex-wrap items-center gap-2">
              <span className={`rounded-full border px-3 py-1 text-xs font-black ${urgencyClass(plan.urgency)}`}>{plan.urgency} proof gap</span>
              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-black text-slate-700">{plan.caseCode}</span>
            </div>
            <CardTitle>{plan.folderName}</CardTitle>
            <CardDescription>{plan.summaryNote}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 lg:grid-cols-3">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="flex items-center gap-2 text-xs font-black uppercase tracking-wide text-slate-500"><FolderTree className="h-4 w-4" /> Folder structure</p>
              <ul className="mt-3 grid gap-2 break-words font-mono text-xs leading-6 text-slate-700">
                {plan.folderStructure.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-black uppercase tracking-wide text-slate-500">File name examples</p>
              <ul className="mt-3 grid gap-2 break-words font-mono text-xs leading-6 text-slate-700">
                {plan.fileNameExamples.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </div>
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
              <p className="text-xs font-black uppercase tracking-wide text-emerald-900">Copy proof index</p>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-emerald-950">{plan.copyReadyIndex}</p>
              <Button type="button" variant="outline" onClick={copyIndex} className="mt-4 w-full"><Copy className="h-4 w-4" />{copied ? 'Copied' : 'Copy index'}</Button>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-black uppercase tracking-wide text-slate-500">Required proof</p>
              <ul className="mt-3 grid gap-2 text-sm leading-6 text-slate-700">
                {plan.requiredProof.map((item) => <li key={item} className="flex gap-2"><CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-700" />{item}</li>)}
              </ul>
            </div>
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-xs font-black uppercase tracking-wide text-amber-900">Missing / weak proof</p>
              <ul className="mt-3 grid gap-2 text-sm leading-6 text-amber-900">
                {(plan.missingProof.length ? plan.missingProof : ['No major missing proof detected from your notes.']).map((item) => <li key={item} className="flex gap-2"><AlertTriangle className="mt-1 h-4 w-4 shrink-0" />{item}</li>)}
              </ul>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-black uppercase tracking-wide text-slate-500">Share pack rules</p>
              <ul className="mt-3 grid gap-2 text-sm leading-6 text-slate-700">
                {plan.sharePack.map((item) => <li key={item} className="flex gap-2"><CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-700" />{item}</li>)}
              </ul>
            </div>
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 lg:col-span-3">
              <p className="text-sm font-black text-rose-950">Redaction warnings</p>
              <ul className="mt-2 grid gap-2 text-sm leading-6 text-rose-900 md:grid-cols-2">
                {plan.redactionWarnings.map((item) => <li key={item} className="flex gap-2"><AlertTriangle className="mt-1 h-4 w-4 shrink-0" />{item}</li>)}
              </ul>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}
