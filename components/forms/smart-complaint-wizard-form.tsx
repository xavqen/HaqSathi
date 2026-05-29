'use client'

import { useMemo, useState, type ReactNode } from 'react'
import Link from 'next/link'
import { ArrowRight, ClipboardCheck, Copy, FileText, MessageCircle, PhoneCall, Wand2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { CopyButton } from '@/components/ui/copy-button'
import { LANGUAGE_OPTIONS } from '@/lib/i18n/languages'
import type { SmartComplaintWizardResult } from '@/lib/validators/phase27'

type ApiResponse = { ok: true; result: SmartComplaintWizardResult } | { ok: false; error: string; details?: unknown }

export function SmartComplaintWizardForm() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<SmartComplaintWizardResult | null>(null)
  const [step, setStep] = useState(1)

  async function submit(formData: FormData) {
    setLoading(true)
    setError('')
    setResult(null)
    const payload = Object.fromEntries(formData.entries())
    const res = await fetch('/api/tools/smart-complaint-wizard', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    const data = (await res.json().catch(() => ({ ok: false, error: 'Server JSON error' }))) as ApiResponse
    setLoading(false)
    if (!data.ok) return setError(data.error || 'Wizard failed')
    setResult(data.result)
    setStep(4)
  }

  const scoreTone = useMemo(() => {
    const score = result?.readinessScore || 0
    if (score >= 80) return 'bg-emerald-50 text-emerald-800 border-emerald-200'
    if (score >= 55) return 'bg-amber-50 text-amber-900 border-amber-200'
    return 'bg-red-50 text-red-800 border-red-200'
  }, [result])

  return (
    <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
      <div className="rounded-[2rem] border bg-white p-4 shadow-soft sm:p-6">
        <div className="mb-5">
          <p className="text-sm font-bold uppercase tracking-wider text-emerald-700">Mobile-first smart flow</p>
          <h2 className="mt-1 text-2xl font-black">Complaint pack builder</h2>
          <div className="mt-4 grid grid-cols-4 gap-2 text-center text-xs font-bold">
            {['Issue', 'Proof', 'Goal', 'Pack'].map((label, index) => <button key={label} type="button" onClick={() => setStep(index + 1)} className={`rounded-2xl px-2 py-3 ${step === index + 1 ? 'bg-primary text-primary-foreground' : 'bg-slate-100 text-slate-600'}`}>{index + 1}. {label}</button>)}
          </div>
        </div>
        <form action={submit} className="space-y-4">
          <div className={step === 1 ? 'grid gap-4' : 'hidden'}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2"><Label>Issue type</Label><Select name="issueType" className="h-12 text-base" defaultValue="REFUND"><option value="REFUND">Refund not received</option><option value="UPI_WRONG_TRANSFER">UPI wrong transfer</option><option value="UPI_FRAUD">UPI fraud/scam</option><option value="BANK_DEBIT">Bank debit issue</option><option value="ECOMMERCE">E-commerce complaint</option><option value="SERVICE_COMPLAINT">Service complaint</option><option value="SCHOLARSHIP">Scholarship help</option><option value="DOCUMENT">Document/application issue</option><option value="OTHER">Other</option></Select></div>
              <div className="grid gap-2"><Label>Urgency</Label><Select name="urgency" className="h-12 text-base" defaultValue="NORMAL"><option value="NORMAL">Normal</option><option value="HIGH">High</option><option value="FRAUD_EMERGENCY">Fraud emergency</option></Select></div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2"><div className="grid gap-2"><Label>Company / bank / authority</Label><Input name="companyName" placeholder="Amazon, SBI, PhonePe, college, etc." /></div><div className="grid gap-2"><Label>Reference ID</Label><Input name="referenceId" placeholder="Order ID / UTR / ticket no." /></div></div>
            <div className="grid gap-4 sm:grid-cols-2"><div className="grid gap-2"><Label>Amount</Label><Input name="amount" placeholder="1299" /></div><div className="grid gap-2"><Label>Issue date</Label><Input name="issueDate" placeholder="2026-05-27" /></div></div>
            <Button type="button" onClick={() => setStep(2)} className="w-full rounded-2xl sm:w-auto">Next: Proof <ArrowRight className="ml-2 h-4 w-4" /></Button>
          </div>

          <div className={step === 2 ? 'grid gap-4' : 'hidden'}>
            <div className="grid gap-2"><Label>What happened?</Label><Textarea name="userStory" rows={8} required placeholder="Simple words me issue batao: kya hua, kab hua, amount, company, response..." /></div>
            <div className="grid gap-2"><Label>Evidence available</Label><Textarea name="evidence" rows={5} placeholder="Screenshot, invoice, UTR, chat, email, bank statement, ticket number..." /></div>
            <div className="flex gap-2"><Button type="button" variant="outline" onClick={() => setStep(1)}>Back</Button><Button type="button" onClick={() => setStep(3)}>Next: Goal</Button></div>
          </div>

          <div className={step === 3 ? 'grid gap-4' : 'hidden'}>
            <div className="grid gap-2"><Label>Previous response</Label><Textarea name="previousResponse" rows={5} placeholder="Company/bank ne kya reply diya? optional" /></div>
            <div className="grid gap-2"><Label>Desired resolution</Label><Textarea name="desiredResolution" rows={4} placeholder="Refund, reversal, replacement, written status, compensation etc." /></div>
            <div className="grid gap-4 sm:grid-cols-2"><div className="grid gap-2"><Label>Language</Label><Select name="language" defaultValue="ENGLISH" className="h-12 text-base">{LANGUAGE_OPTIONS.map((language) => <option key={language.code} value={language.code}>{language.label} — {language.nativeName}</option>)}</Select></div><div className="grid gap-2"><Label>User type</Label><Select name="userType" defaultValue="INDIVIDUAL" className="h-12 text-base"><option value="INDIVIDUAL">Individual</option><option value="FAMILY">Family</option><option value="AGENT">Agent / cyber cafe</option></Select></div></div>
            <div className="flex flex-wrap gap-2"><Button type="button" variant="outline" onClick={() => setStep(2)}>Back</Button><Button disabled={loading} size="lg" className="rounded-2xl"><Wand2 className="mr-2 h-4 w-4" />{loading ? 'Building pack...' : 'Build smart complaint pack'}</Button></div>
            {error && <p className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}
          </div>
        </form>
      </div>

      <div className="rounded-[2rem] border bg-white p-4 shadow-soft sm:p-6">
        {!result ? (
          <div className="flex min-h-[520px] flex-col items-center justify-center rounded-3xl border border-dashed bg-slate-50 p-6 text-center">
            <ClipboardCheck className="h-12 w-12 text-slate-400" />
            <h2 className="mt-4 text-2xl font-black">Smart pack yahan banega</h2>
            <p className="mt-2 max-w-md text-sm leading-6 text-slate-600">Readiness score, missing proof, complaint draft, follow-up text, WhatsApp message, call script aur action timeline ek hi place par.</p>
          </div>
        ) : (
          <div className="space-y-5">
            <div className={`rounded-3xl border p-5 ${scoreTone}`}><p className="text-sm font-bold uppercase tracking-wider">Readiness score</p><div className="mt-2 text-5xl font-black">{result.readinessScore}/100</div><p className="mt-2 font-bold">{result.grade}</p></div>
            <div className="rounded-2xl bg-slate-50 p-4"><b>Case summary</b><p className="mt-2 text-sm leading-7 text-slate-700">{result.caseSummary}</p><p className="mt-2 text-xs font-semibold text-emerald-700">{result.dashboardSuggestion}</p></div>
            <List title="Missing / improve first" items={result.missingFields} empty="No major missing field detected." tone="warn" />
            <List title="Evidence checklist" items={result.evidenceChecklist} />
            <div className="rounded-2xl bg-slate-50 p-4"><b>Action plan</b><div className="mt-3 space-y-3">{result.actionPlan.map((item) => <div key={item.day + item.title} className="rounded-2xl border bg-white p-3"><p className="text-xs font-bold uppercase text-emerald-700">{item.day} · {item.channel}</p><p className="font-black">{item.title}</p><p className="text-sm text-slate-600">{item.action}</p></div>)}</div></div>
            <DraftBox icon={<FileText className="h-4 w-4" />} title="Complaint draft" text={result.complaintDraft} />
            <DraftBox icon={<MessageCircle className="h-4 w-4" />} title="WhatsApp/support message" text={result.whatsappMessage} />
            <DraftBox icon={<PhoneCall className="h-4 w-4" />} title="Call script" text={result.callScript} />
            <DraftBox icon={<Copy className="h-4 w-4" />} title="Follow-up draft" text={result.followUpDraft} />
            <List title="Risk warnings" items={result.riskWarnings} tone="danger" empty="No high-risk warning detected." />
            <p className="rounded-2xl border bg-amber-50 p-4 text-xs leading-6 text-amber-900">{result.disclaimer}</p>
            <div className="flex flex-wrap gap-2"><Link href="/dashboard/follow-ups" className="rounded-2xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground">Create reminders</Link><Link href="/dashboard/evidence-packs" className="rounded-2xl border px-5 py-3 text-sm font-bold">Build evidence pack</Link></div>
          </div>
        )}
      </div>
    </div>
  )
}

function DraftBox({ title, text, icon }: { title: string; text: string; icon: ReactNode }) {
  return <div className="rounded-2xl bg-slate-50 p-4"><div className="mb-2 flex items-center justify-between gap-3"><div className="flex items-center gap-2"><span className="text-emerald-700">{icon}</span><b>{title}</b></div><CopyButton text={text} /></div><pre className="whitespace-pre-wrap text-sm leading-7 text-slate-700">{text}</pre></div>
}

function List({ title, items, tone, empty }: { title: string; items: string[]; tone?: 'warn' | 'danger'; empty?: string }) {
  const cls = tone === 'danger' ? 'border-red-200 bg-red-50 text-red-900' : tone === 'warn' ? 'border-amber-200 bg-amber-50 text-amber-950' : 'bg-slate-50 text-slate-700'
  return <div className={`rounded-2xl border p-4 ${cls}`}><b>{title}</b>{items.length ? <ul className="mt-3 list-disc space-y-2 pl-5 text-sm">{items.map((item) => <li key={item}>{item}</li>)}</ul> : <p className="mt-2 text-sm">{empty || 'None'}</p>}</div>
}
