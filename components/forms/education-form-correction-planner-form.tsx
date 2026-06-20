"use client"

import { useMemo, useState } from 'react'
import { AlertTriangle, CheckCircle2, ClipboardList, Copy, FileText, GraduationCap, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { buildEducationFormCorrectionPlan, educationFormTypes, educationMistakeTypes } from '@/lib/productivity/education-form-correction-planner'

const initialState = {
  formType: 'exam-form',
  institutionOrPortal: '',
  applicantName: '',
  applicationId: '',
  examOrCourse: '',
  mistakeType: 'Name spelling mistake',
  wrongValue: '',
  correctValue: '',
  lastDate: '',
  correctionWindow: '',
  contactChannel: '',
  issueSummary: '',
  evidenceAvailable: '',
  desiredOutcome: 'Please allow correction or guide me to the official correction process and confirm the next step in writing'
}

export function EducationFormCorrectionPlannerForm() {
  const [form, setForm] = useState(initialState)
  const [copied, setCopied] = useState(false)
  const plan = useMemo(() => buildEducationFormCorrectionPlan(form), [form])

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
          <GraduationCap className="h-7 w-7 text-emerald-700" />
          <CardTitle>Education form correction details</CardTitle>
          <CardDescription>Use official facts only. Do not enter OTP, password, UPI PIN, CVV, full Aadhaar/PAN, full bank account or private login details.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="formType">Form type</Label>
              <select id="formType" value={form.formType} onChange={(event) => update('formType', event.target.value)} className="min-h-11 rounded-xl border border-input bg-white px-3 text-sm font-semibold text-slate-800">
                {educationFormTypes.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="mistakeType">Mistake type</Label>
              <select id="mistakeType" value={form.mistakeType} onChange={(event) => update('mistakeType', event.target.value)} className="min-h-11 rounded-xl border border-input bg-white px-3 text-sm font-semibold text-slate-800">
                {educationMistakeTypes.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </div>
            <div className="grid gap-2"><Label htmlFor="institutionOrPortal">Institution / portal / authority</Label><Input id="institutionOrPortal" value={form.institutionOrPortal} onChange={(event) => update('institutionOrPortal', event.target.value)} placeholder="Example: NTA / college / scholarship portal" /></div>
            <div className="grid gap-2"><Label htmlFor="applicantName">Applicant name</Label><Input id="applicantName" value={form.applicantName} onChange={(event) => update('applicantName', event.target.value)} placeholder="Name on form" /></div>
            <div className="grid gap-2"><Label htmlFor="applicationId">Application / registration ID</Label><Input id="applicationId" value={form.applicationId} onChange={(event) => update('applicationId', event.target.value)} placeholder="Application number" /></div>
            <div className="grid gap-2"><Label htmlFor="examOrCourse">Exam / course / scheme</Label><Input id="examOrCourse" value={form.examOrCourse} onChange={(event) => update('examOrCourse', event.target.value)} placeholder="Example: JEE / scholarship / admission" /></div>
            <div className="grid gap-2"><Label htmlFor="wrongValue">Wrong value submitted</Label><Input id="wrongValue" value={form.wrongValue} onChange={(event) => update('wrongValue', event.target.value)} placeholder="Example: wrong spelling / DOB / category" /></div>
            <div className="grid gap-2"><Label htmlFor="correctValue">Correct value</Label><Input id="correctValue" value={form.correctValue} onChange={(event) => update('correctValue', event.target.value)} placeholder="Correct detail as per document" /></div>
            <div className="grid gap-2"><Label htmlFor="lastDate">Last date / deadline</Label><Input id="lastDate" type="date" value={form.lastDate} onChange={(event) => update('lastDate', event.target.value)} /></div>
            <div className="grid gap-2"><Label htmlFor="correctionWindow">Correction window/status</Label><Input id="correctionWindow" value={form.correctionWindow} onChange={(event) => update('correctionWindow', event.target.value)} placeholder="Open / closed / not sure" /></div>
            <div className="grid gap-2 md:col-span-2"><Label htmlFor="contactChannel">Official contact channel</Label><Input id="contactChannel" value={form.contactChannel} onChange={(event) => update('contactChannel', event.target.value)} placeholder="Official portal/email/helpdesk/school office" /></div>
            <div className="grid gap-2 md:col-span-2"><Label htmlFor="issueSummary">Issue summary</Label><Textarea id="issueSummary" value={form.issueSummary} onChange={(event) => update('issueSummary', event.target.value)} placeholder="What happened, when submitted, what is wrong, deadline status" /></div>
            <div className="grid gap-2 md:col-span-2"><Label htmlFor="evidenceAvailable">Evidence available</Label><Textarea id="evidenceAvailable" value={form.evidenceAvailable} onChange={(event) => update('evidenceAvailable', event.target.value)} placeholder="Application copy, fee receipt, screenshot, correct document proof, notice link" /></div>
            <div className="grid gap-2 md:col-span-2"><Label htmlFor="desiredOutcome">Desired outcome</Label><Textarea id="desiredOutcome" value={form.desiredOutcome} onChange={(event) => update('desiredOutcome', event.target.value)} /></div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6">
        <Card className="border-emerald-100 bg-white">
          <CardHeader>
            <ShieldCheck className="h-7 w-7 text-emerald-700" />
            <CardTitle>Correction plan</CardTitle>
            <CardDescription>{plan.summary}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-black uppercase tracking-wide text-slate-500">Urgency score</p>
                <p className="mt-1 text-3xl font-black text-slate-950">{plan.urgencyScore}/100</p>
                <p className="mt-1 text-sm font-semibold text-slate-700">{plan.urgencyLevel}</p>
                <p className="mt-1 text-xs font-bold text-slate-500">Days left: {plan.daysRemaining ?? 'not known'} · Correction window: {plan.hasCorrectionWindow ? 'likely available' : 'verify officially'}</p>
              </div>
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
                <div className="flex gap-2 font-black"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> Official route only</div>
                <p className="mt-1">Use the official portal/helpdesk/institution first. Avoid agents who ask for fee, OTP, login password or screen-share access.</p>
              </div>
              <Button onClick={copyMessage} className="min-h-12 w-full rounded-xl font-black"><Copy className="mr-2 h-4 w-4" /> {copied ? 'Copied correction message' : 'Copy correction message'}</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="xl:col-span-2">
        <CardHeader>
          <ClipboardList className="h-7 w-7 text-emerald-700" />
          <CardTitle>Proof checklist + next steps</CardTitle>
          <CardDescription>Prepare a clean proof pack before submitting correction or appeal.</CardDescription>
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
              <h2 className="font-black text-slate-950">Next action route</h2>
              <div className="mt-3 grid gap-3">
                {plan.nextSteps.map((item) => (
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
          <CardTitle>Copy-ready correction request</CardTitle>
          <CardDescription>Review and attach redacted proof before sending.</CardDescription>
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
