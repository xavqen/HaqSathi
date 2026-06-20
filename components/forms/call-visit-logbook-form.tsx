'use client'

import { useMemo, useState } from 'react'
import { AlertTriangle, CalendarClock, CheckCircle2, ClipboardList, Copy, FileText, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { buildCallVisitLogbookPlan, interactionChannels } from '@/lib/productivity/call-visit-logbook'

function today() {
  return new Date().toISOString().slice(0, 10)
}

function urgencyClass(urgency: string) {
  if (urgency === 'URGENT') return 'border-rose-200 bg-rose-50 text-rose-800'
  if (urgency === 'HIGH') return 'border-orange-200 bg-orange-50 text-orange-800'
  if (urgency === 'NORMAL') return 'border-amber-200 bg-amber-50 text-amber-800'
  return 'border-emerald-200 bg-emerald-50 text-emerald-800'
}

export function CallVisitLogbookForm() {
  const [issueTitle, setIssueTitle] = useState('Refund still pending')
  const [channel, setChannel] = useState('phone-call')
  const [interactionDate, setInteractionDate] = useState(today())
  const [contactName, setContactName] = useState('Customer care agent')
  const [referenceId, setReferenceId] = useState('Ticket ID not provided')
  const [promisedDate, setPromisedDate] = useState('')
  const [mood, setMood] = useState('delayed')
  const [outcome, setOutcome] = useState('They said they will check and call back, but no written update was given.')
  const [submitted, setSubmitted] = useState(true)
  const [copied, setCopied] = useState(false)

  const plan = useMemo(() => buildCallVisitLogbookPlan({ issueTitle, channel, interactionDate, contactName, referenceId, promisedDate, mood, outcome }), [issueTitle, channel, interactionDate, contactName, referenceId, promisedDate, mood, outcome])

  const copyMessage = async () => {
    await navigator.clipboard?.writeText(plan.followUpMessage)
    setCopied(true)
    setTimeout(() => setCopied(false), 1600)
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      <Card>
        <CardHeader>
          <ClipboardList className="h-7 w-7 text-emerald-700" />
          <CardTitle>Create call/visit log</CardTitle>
          <CardDescription>Record what happened, what proof to save and when to follow up. Keep it safe for complaint escalation.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="issue-title">Issue title</Label>
              <Input id="issue-title" value={issueTitle} onChange={(event) => { setIssueTitle(event.target.value); setSubmitted(false) }} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="interaction-channel">Interaction type</Label>
              <select id="interaction-channel" value={channel} onChange={(event) => { setChannel(event.target.value); setSubmitted(false) }} className="min-h-12 w-full rounded-2xl border border-input bg-background px-4 py-3 text-base outline-none focus-visible:ring-2 focus-visible:ring-ring">
                {interactionChannels.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="interaction-date">Date</Label>
              <Input id="interaction-date" type="date" value={interactionDate} onChange={(event) => { setInteractionDate(event.target.value); setSubmitted(false) }} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="promised-date">Promised date optional</Label>
              <Input id="promised-date" type="date" value={promisedDate} onChange={(event) => { setPromisedDate(event.target.value); setSubmitted(false) }} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-name">Contact / staff name optional</Label>
              <Input id="contact-name" value={contactName} onChange={(event) => { setContactName(event.target.value); setSubmitted(false) }} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reference-id">Ticket / reference ID</Label>
              <Input id="reference-id" value={referenceId} onChange={(event) => { setReferenceId(event.target.value); setSubmitted(false) }} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="interaction-mood">Response quality</Label>
            <select id="interaction-mood" value={mood} onChange={(event) => { setMood(event.target.value); setSubmitted(false) }} className="min-h-12 w-full rounded-2xl border border-input bg-background px-4 py-3 text-base outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <option value="helpful">Helpful</option>
              <option value="neutral">Neutral</option>
              <option value="delayed">Delayed / pending</option>
              <option value="rude">Rude / unprofessional</option>
              <option value="refused">Refused / denied</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="outcome">What happened</Label>
            <Textarea id="outcome" value={outcome} onChange={(event) => { setOutcome(event.target.value); setSubmitted(false) }} />
          </div>
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
            <div className="flex gap-2 font-black"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> Safety note</div>
            <p className="mt-1">Do not write OTP, password, UPI PIN, CVV, full card/bank data, full Aadhaar/PAN or private address in this log.</p>
          </div>
          <Button type="button" size="lg" onClick={() => setSubmitted(true)} className="w-full sm:w-auto">Build logbook entry</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <ShieldCheck className="h-7 w-7 text-emerald-700" />
          <CardTitle>Why this helps</CardTitle>
          <CardDescription>A clean log makes follow-ups, bank disputes and complaint escalation stronger.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="grid gap-2 text-sm leading-6 text-slate-700">
            <li className="flex gap-2"><CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-700" />Tracks verbal promises and missed dates.</li>
            <li className="flex gap-2"><CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-700" />Creates written follow-up message.</li>
            <li className="flex gap-2"><CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-700" />Reminds what proof to preserve.</li>
          </ul>
        </CardContent>
      </Card>

      {submitted ? (
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex flex-wrap items-center gap-2">
              <span className={`rounded-full border px-3 py-1 text-xs font-black ${urgencyClass(plan.urgency)}`}>{plan.urgency}</span>
              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-black text-slate-700">{plan.channel.label}</span>
            </div>
            <CardTitle>{plan.headline}</CardTitle>
            <CardDescription>Interaction: {plan.interactionDate} · Next follow-up: {plan.nextFollowUpDate}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 lg:grid-cols-3">
            <div className="rounded-2xl bg-slate-50 p-4 lg:col-span-3">
              <p className="text-xs font-black uppercase tracking-wide text-slate-500">Log summary</p>
              <p className="mt-2 text-sm leading-6 text-slate-700">{plan.logSummary}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-black uppercase tracking-wide text-slate-500">Proof checklist</p>
              <ul className="mt-3 grid gap-2 text-sm leading-6 text-slate-700">
                {plan.proofChecklist.map((item) => <li key={item} className="flex gap-2"><FileText className="mt-1 h-4 w-4 shrink-0 text-emerald-700" />{item}</li>)}
              </ul>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-black uppercase tracking-wide text-slate-500">Next actions</p>
              <ul className="mt-3 grid gap-2 text-sm leading-6 text-slate-700">
                {plan.nextActions.map((item) => <li key={item} className="flex gap-2"><CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-700" />{item}</li>)}
              </ul>
            </div>
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
              <p className="text-xs font-black uppercase tracking-wide text-emerald-900">Copy follow-up message</p>
              <p className="mt-3 text-sm leading-6 text-emerald-950">{plan.followUpMessage}</p>
              <Button type="button" variant="outline" onClick={copyMessage} className="mt-4 w-full"><Copy className="h-4 w-4" />{copied ? 'Copied' : 'Copy message'}</Button>
            </div>
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 lg:col-span-3">
              <p className="text-sm font-black text-amber-950">Privacy + safety warnings</p>
              <ul className="mt-2 grid gap-2 text-sm leading-6 text-amber-900 md:grid-cols-3">
                {plan.safetyWarnings.map((item) => <li key={item} className="flex gap-2"><AlertTriangle className="mt-1 h-4 w-4 shrink-0" />{item}</li>)}
              </ul>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}
