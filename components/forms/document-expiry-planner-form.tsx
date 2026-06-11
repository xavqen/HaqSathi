'use client'

import { useMemo, useState } from 'react'
import { AlertTriangle, CalendarClock, CheckCircle2, FileWarning, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { buildDocumentRenewalPlan, documentExpiryTypes } from '@/lib/documents/document-expiry-planner'

function urgencyClass(urgency: string) {
  if (urgency === 'EXPIRED') return 'border-rose-200 bg-rose-50 text-rose-800'
  if (urgency === 'URGENT') return 'border-orange-200 bg-orange-50 text-orange-800'
  if (urgency === 'SOON') return 'border-amber-200 bg-amber-50 text-amber-800'
  return 'border-emerald-200 bg-emerald-50 text-emerald-800'
}

function defaultDate() {
  const date = new Date()
  date.setMonth(date.getMonth() + 2)
  return date.toISOString().slice(0, 10)
}

export function DocumentExpiryPlannerForm() {
  const [typeId, setTypeId] = useState('income-certificate')
  const [expiryDate, setExpiryDate] = useState(defaultDate())
  const [submitted, setSubmitted] = useState(true)
  const plan = useMemo(() => buildDocumentRenewalPlan(typeId, expiryDate), [typeId, expiryDate])

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      <Card>
        <CardHeader>
          <CalendarClock className="h-7 w-7 text-emerald-700" />
          <CardTitle>Plan document renewal</CardTitle>
          <CardDescription>Choose document type and expiry date. The planner gives renewal window, reminders and proof checklist.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="document-type">Document type</Label>
              <select
                id="document-type"
                value={typeId}
                onChange={(event) => { setTypeId(event.target.value); setSubmitted(false) }}
                className="min-h-12 w-full rounded-2xl border border-input bg-background px-4 py-3 text-base outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {documentExpiryTypes.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="expiry-date">Expiry / last valid date</Label>
              <Input id="expiry-date" type="date" value={expiryDate} onChange={(event) => { setExpiryDate(event.target.value); setSubmitted(false) }} />
            </div>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
            <div className="flex gap-2 font-black"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> Safety note</div>
            <p className="mt-1">Do not paste Aadhaar number, OTP, password, UPI PIN, CVV, full card/bank details or raw document scans here. This tool only needs date and document type.</p>
          </div>

          <Button type="button" size="lg" onClick={() => setSubmitted(true)} className="w-full sm:w-auto">Create renewal plan</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <ShieldCheck className="h-7 w-7 text-emerald-700" />
          <CardTitle>Official-only rule</CardTitle>
          <CardDescription>Use verified portals or official counters. Avoid unknown agents and links.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="grid gap-2 text-sm leading-6 text-slate-700">
            <li className="flex gap-2"><CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-700" />Keep acknowledgement and payment receipt.</li>
            <li className="flex gap-2"><CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-700" />Take status screenshots from official portal.</li>
            <li className="flex gap-2"><CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-700" />Set reminder before portal rush or deadline.</li>
          </ul>
        </CardContent>
      </Card>

      {submitted && plan ? (
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex flex-wrap items-center gap-2">
              <span className={`rounded-full border px-3 py-1 text-xs font-black ${urgencyClass(plan.urgency)}`}>{plan.urgency}</span>
              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-black text-slate-700">{plan.type.category}</span>
            </div>
            <CardTitle>{plan.headline}</CardTitle>
            <CardDescription>Expiry: {plan.expiryDate} · Renewal start: {plan.renewalStartDate}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 lg:grid-cols-3">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-black uppercase tracking-wide text-slate-500">Reminder dates</p>
              <div className="mt-3 grid gap-2 text-sm font-bold text-slate-800">
                <p>First: {plan.firstReminderDate}</p>
                <p>Second: {plan.secondReminderDate}</p>
                <p>Final: {plan.finalReminderDate}</p>
              </div>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-black uppercase tracking-wide text-slate-500">Checklist</p>
              <ul className="mt-3 grid gap-2 text-sm leading-6 text-slate-700">
                {plan.type.checklist.map((item) => <li key={item} className="flex gap-2"><FileWarning className="mt-1 h-4 w-4 shrink-0 text-emerald-700" />{item}</li>)}
              </ul>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-black uppercase tracking-wide text-slate-500">Next actions</p>
              <ul className="mt-3 grid gap-2 text-sm leading-6 text-slate-700">
                {plan.nextActions.map((item) => <li key={item} className="flex gap-2"><CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-700" />{item}</li>)}
              </ul>
            </div>
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 lg:col-span-3">
              <p className="text-sm font-black text-amber-950">Privacy + fraud warnings</p>
              <ul className="mt-2 grid gap-2 text-sm leading-6 text-amber-900 md:grid-cols-3">
                {plan.privacyWarnings.map((item) => <li key={item} className="flex gap-2"><AlertTriangle className="mt-1 h-4 w-4 shrink-0" />{item}</li>)}
              </ul>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}
