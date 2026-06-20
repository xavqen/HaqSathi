"use client"

import { useMemo, useState } from 'react'
import { AlertTriangle, Banknote, CheckCircle2, ClipboardList, Copy, FileText, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { buildBankAccountFreezePlan, bankFreezeIssueTypes } from '@/lib/productivity/bank-account-freeze-planner'

const initialState = {
  issueType: 'account-freeze',
  bankName: '',
  accountType: '',
  amountBlocked: '',
  freezeDate: '',
  noticeSource: '',
  transactionReference: '',
  complaintId: '',
  currentStatus: '',
  evidenceAvailable: '',
  desiredOutcome: 'Please provide written reason, pending action, resolution timeline and escalation path'
}

export function BankAccountFreezePlannerForm() {
  const [form, setForm] = useState(initialState)
  const [copied, setCopied] = useState(false)
  const plan = useMemo(() => buildBankAccountFreezePlan(form), [form])

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
          <div className="flex items-center gap-2 text-sm font-black text-emerald-800"><Banknote className="h-5 w-5" /> Account freeze details</div>
          <CardTitle>Build a bank freeze/lien plan</CardTitle>
          <CardDescription>Use masked details only. Never paste OTP, UPI PIN, CVV, password, full account number or full ID.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="bank-freeze-issue-type">Issue type</Label>
              <select id="bank-freeze-issue-type" value={form.issueType} onChange={(event) => update('issueType', event.target.value)} className="min-h-11 w-full rounded-xl border bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                {bankFreezeIssueTypes.map((issue) => <option key={issue.id} value={issue.id}>{issue.label}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bank-name">Bank name</Label>
              <Input id="bank-name" value={form.bankName} onChange={(event) => update('bankName', event.target.value)} placeholder="SBI / HDFC / ICICI / Paytm Payments Bank" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bank-account-type">Account type</Label>
              <Input id="bank-account-type" value={form.accountType} onChange={(event) => update('accountType', event.target.value)} placeholder="Savings / Current / Salary / Wallet" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount-blocked">Amount blocked/affected</Label>
              <Input id="amount-blocked" value={form.amountBlocked} onChange={(event) => update('amountBlocked', event.target.value)} placeholder="₹25,000" inputMode="decimal" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="freeze-date">Freeze/hold noticed on</Label>
              <Input id="freeze-date" type="date" value={form.freezeDate} onChange={(event) => update('freezeDate', event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notice-source">Notice/source</Label>
              <Input id="notice-source" value={form.noticeSource} onChange={(event) => update('noticeSource', event.target.value)} placeholder="SMS / app / branch / cyber ref / statement" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="transaction-reference">Transaction/reference ID</Label>
              <Input id="transaction-reference" value={form.transactionReference} onChange={(event) => update('transactionReference', event.target.value)} placeholder="UTR/reference/hold ID, masked if needed" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bank-complaint-id">Complaint/ticket ID</Label>
              <Input id="bank-complaint-id" value={form.complaintId} onChange={(event) => update('complaintId', event.target.value)} placeholder="Bank SR / ticket number" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bank-current-status">Current status</Label>
            <Textarea id="bank-current-status" value={form.currentStatus} onChange={(event) => update('currentStatus', event.target.value)} placeholder="What bank/app/branch has told you so far?" className="min-h-24" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bank-evidence">Evidence available</Label>
            <Textarea id="bank-evidence" value={form.evidenceAvailable} onChange={(event) => update('evidenceAvailable', event.target.value)} placeholder="Statement screenshot, SMS, app notice, branch visit notes, transaction reference, KYC proof..." className="min-h-24" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bank-outcome">Desired outcome</Label>
            <Textarea id="bank-outcome" value={form.desiredOutcome} onChange={(event) => update('desiredOutcome', event.target.value)} className="min-h-20" />
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
          <CardContent>
            <p className="text-sm leading-6 text-emerald-950">{plan.summary}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><ClipboardList className="h-5 w-5 text-emerald-700" /> Proof checklist</CardTitle></CardHeader>
          <CardContent><ul className="space-y-2 text-sm leading-6 text-slate-700">{plan.proofChecklist.map((item) => <li key={item} className="flex gap-2"><CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-700" />{item}</li>)}</ul></CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Escalation route</CardTitle><CardDescription>Keep everything written and proof-based.</CardDescription></CardHeader>
          <CardContent className="space-y-3">{plan.escalationRoute.map((item) => <div key={item.step} className="rounded-2xl border border-slate-200 p-3"><div className="text-xs font-black text-emerald-700">{item.step}</div><div className="font-black text-slate-950">{item.title}</div><p className="text-sm leading-6 text-slate-600">{item.action}</p></div>)}</CardContent>
        </Card>

        <Card className="border-amber-200 bg-amber-50">
          <CardHeader><CardTitle className="flex items-center gap-2 text-amber-950"><AlertTriangle className="h-5 w-5" /> Safety warnings</CardTitle></CardHeader>
          <CardContent><ul className="space-y-2 text-sm leading-6 text-amber-950">{plan.safetyWarnings.map((warning) => <li key={warning}>• {warning}</li>)}</ul></CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-emerald-700" /> Copy-ready bank message</CardTitle>
            <CardDescription>Review and edit before sending through official bank channel.</CardDescription>
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
