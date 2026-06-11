'use client'

import { useMemo, useState } from 'react'
import { AlertTriangle, CalendarClock, CheckCircle2, ClipboardList, Copy, FileText, Route } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { buildDeadlineAppealPlan, deadlineAppealIssueTypes } from '@/lib/productivity/deadline-appeal-planner'

function today() {
  return new Date().toISOString().slice(0, 10)
}

function daysAgo(days: number) {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return date.toISOString().slice(0, 10)
}

function urgencyClass(urgency: string) {
  if (urgency === 'OVERDUE' || urgency === 'CRITICAL') return 'border-rose-200 bg-rose-50 text-rose-800'
  if (urgency === 'SOON' || urgency === 'UNKNOWN') return 'border-amber-200 bg-amber-50 text-amber-800'
  return 'border-emerald-200 bg-emerald-50 text-emerald-800'
}

export function DeadlineAppealPlannerForm() {
  const [caseTitle, setCaseTitle] = useState('Scholarship form rejected due to document issue')
  const [issueType, setIssueType] = useState('scheme')
  const [authorityOrCompany, setAuthorityOrCompany] = useState('Scholarship Helpdesk')
  const [referenceId, setReferenceId] = useState('APP-12345')
  const [lastActionDate, setLastActionDate] = useState(daysAgo(5))
  const [replyOrOrderDate, setReplyOrOrderDate] = useState(daysAgo(2))
  const [finalDeadlineDate, setFinalDeadlineDate] = useState(today())
  const [currentStatus, setCurrentStatus] = useState('Rejected because uploaded document is unclear. I need to appeal before the deadline.')
  const [submitted, setSubmitted] = useState(true)
  const [copied, setCopied] = useState(false)

  const plan = useMemo(() => buildDeadlineAppealPlan({ caseTitle, issueType, authorityOrCompany, referenceId, lastActionDate, replyOrOrderDate, finalDeadlineDate, currentStatus }), [caseTitle, issueType, authorityOrCompany, referenceId, lastActionDate, replyOrOrderDate, finalDeadlineDate, currentStatus])

  const copyAppeal = async () => {
    await navigator.clipboard?.writeText(plan.copyReadyAppealNote)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1600)
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      <Card>
        <CardHeader>
          <CalendarClock className="h-7 w-7 text-emerald-700" />
          <CardTitle>Build deadline + appeal plan</CardTitle>
          <CardDescription>Plan reminder dates, appeal timing, proof checklist and copy-ready escalation text.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="deadline-case-title">Case title</Label>
              <Input id="deadline-case-title" value={caseTitle} onChange={(event) => { setCaseTitle(event.target.value); setSubmitted(false) }} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deadline-issue-type">Issue type</Label>
              <select id="deadline-issue-type" value={issueType} onChange={(event) => { setIssueType(event.target.value); setSubmitted(false) }} className="min-h-12 w-full rounded-2xl border border-input bg-background px-4 py-3 text-base outline-none focus-visible:ring-2 focus-visible:ring-ring">
                {deadlineAppealIssueTypes.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="deadline-authority">Company / authority</Label>
              <Input id="deadline-authority" value={authorityOrCompany} onChange={(event) => { setAuthorityOrCompany(event.target.value); setSubmitted(false) }} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deadline-ref">Reference / complaint ID</Label>
              <Input id="deadline-ref" value={referenceId} onChange={(event) => { setReferenceId(event.target.value); setSubmitted(false) }} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deadline-last-action">Last action date</Label>
              <Input id="deadline-last-action" type="date" value={lastActionDate} onChange={(event) => { setLastActionDate(event.target.value); setSubmitted(false) }} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deadline-reply-date">Reply / rejection / order date</Label>
              <Input id="deadline-reply-date" type="date" value={replyOrOrderDate} onChange={(event) => { setReplyOrOrderDate(event.target.value); setSubmitted(false) }} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deadline-final-date">Known final deadline</Label>
              <Input id="deadline-final-date" type="date" value={finalDeadlineDate} onChange={(event) => { setFinalDeadlineDate(event.target.value); setSubmitted(false) }} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="deadline-status">Current status / problem</Label>
            <Textarea id="deadline-status" value={currentStatus} onChange={(event) => { setCurrentStatus(event.target.value); setSubmitted(false) }} />
          </div>
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
            <div className="flex gap-2 font-black"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> Deadline safety note</div>
            <p className="mt-1">This planner estimates action windows. Always verify exact appeal/deadline rules from the official portal, notice, order or authority.</p>
          </div>
          <Button type="button" size="lg" onClick={() => setSubmitted(true)} className="w-full sm:w-auto">Create deadline plan</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <Route className="h-7 w-7 text-emerald-700" />
          <CardTitle>Best for</CardTitle>
          <CardDescription>Cases where late action can weaken your complaint or appeal.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="grid gap-2 text-sm leading-6 text-slate-700">
            <li className="flex gap-2"><CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-700" />Rejected applications or unclear status.</li>
            <li className="flex gap-2"><CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-700" />Refund, bank, service or portal delays.</li>
            <li className="flex gap-2"><CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-700" />Appeal/review requests with proof.</li>
          </ul>
        </CardContent>
      </Card>

      {submitted ? (
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex flex-wrap items-center gap-2">
              <span className={`rounded-full border px-3 py-1 text-xs font-black ${urgencyClass(plan.urgency)}`}>{plan.urgency}</span>
              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-black text-slate-700">{plan.caseCode}</span>
              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-black text-slate-700">Target: {plan.targetDeadline}</span>
            </div>
            <CardTitle>{plan.issueLabel}</CardTitle>
            <CardDescription>{plan.summary}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 lg:grid-cols-3">
            <div className="rounded-2xl bg-slate-50 p-4 lg:col-span-2">
              <p className="flex items-center gap-2 text-xs font-black uppercase tracking-wide text-slate-500"><ClipboardList className="h-4 w-4" /> Timeline</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {plan.timeline.map((item) => (
                  <div key={`${item.label}-${item.date}`} className="rounded-xl border border-slate-200 bg-white p-3">
                    <p className="text-xs font-black uppercase tracking-wide text-slate-500">{item.label}</p>
                    <p className="mt-1 font-black text-slate-950">{item.date}</p>
                    <p className="mt-1 text-xs leading-5 text-slate-600">{item.note}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
              <p className="text-xs font-black uppercase tracking-wide text-emerald-900">Route lane</p>
              <p className="mt-3 text-sm leading-6 text-emerald-950">{plan.routeLane}</p>
              <p className="mt-4 text-xs font-black uppercase tracking-wide text-emerald-900">Escalation date</p>
              <p className="mt-1 text-lg font-black text-emerald-950">{plan.escalationDate}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-black uppercase tracking-wide text-slate-500">Next actions</p>
              <ul className="mt-3 grid gap-2 text-sm leading-6 text-slate-700">
                {plan.nextActions.map((item) => <li key={item} className="flex gap-2"><CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-700" />{item}</li>)}
              </ul>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-black uppercase tracking-wide text-slate-500">Proof checklist</p>
              <ul className="mt-3 grid gap-2 text-sm leading-6 text-slate-700">
                {plan.proofChecklist.map((item) => <li key={item} className="flex gap-2"><CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-700" />{item}</li>)}
              </ul>
            </div>
            <div className="rounded-2xl border border-emerald-100 bg-white p-4">
              <p className="flex items-center gap-2 text-xs font-black uppercase tracking-wide text-slate-500"><FileText className="h-4 w-4" /> Copy appeal note</p>
              <p className="mt-3 max-h-72 overflow-auto whitespace-pre-wrap rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-700">{plan.copyReadyAppealNote}</p>
              <Button type="button" variant="outline" onClick={copyAppeal} className="mt-4 w-full"><Copy className="h-4 w-4" />{copied ? 'Copied' : 'Copy appeal'}</Button>
            </div>
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 lg:col-span-3">
              <p className="text-sm font-black text-rose-950">Safety warnings</p>
              <ul className="mt-2 grid gap-2 text-sm leading-6 text-rose-900 md:grid-cols-2">
                {plan.safetyWarnings.map((item) => <li key={item} className="flex gap-2"><AlertTriangle className="mt-1 h-4 w-4 shrink-0" />{item}</li>)}
              </ul>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}
