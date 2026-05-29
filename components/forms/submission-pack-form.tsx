'use client'

import { useMemo, useState, type ReactNode } from 'react'
import { ArrowRight, CheckCircle2, Mail, MessageCircle, PhoneCall, ShieldAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { CopyButton } from '@/components/ui/copy-button'
import { LANGUAGE_OPTIONS } from '@/lib/i18n/languages'
import type { SubmissionPackResult } from '@/lib/validators/phase28'

type ApiResponse = { ok: true; result: SubmissionPackResult } | { ok: false; error: string; details?: unknown }

export function SubmissionPackForm() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<SubmissionPackResult | null>(null)
  const [step, setStep] = useState(1)

  async function submit(formData: FormData) {
    setLoading(true)
    setError('')
    setResult(null)
    const payload = Object.fromEntries(formData.entries())
    const res = await fetch('/api/tools/submission-pack', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    const data = (await res.json().catch(() => ({ ok: false, error: 'Server JSON error' }))) as ApiResponse
    setLoading(false)
    if (!data.ok) return setError(data.error || 'Submission pack failed')
    setResult(data.result)
    setStep(4)
  }

  const mailLink = useMemo(() => {
    if (!result) return '#'
    return `mailto:?subject=${encodeURIComponent(result.emailSubject)}&body=${encodeURIComponent(result.emailBody)}`
  }, [result])

  const whatsappLink = useMemo(() => {
    if (!result) return '#'
    return `https://wa.me/?text=${encodeURIComponent(result.whatsappMessage)}`
  }, [result])

  return (
    <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
      <div className="rounded-[2rem] border bg-white p-4 shadow-soft sm:p-6">
        <p className="text-sm font-bold uppercase tracking-wider text-emerald-700">Phase 28 · Multi-channel submission</p>
        <h2 className="mt-1 text-2xl font-black">Send-ready complaint pack</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">Mobile users ke liye one screen se email, WhatsApp, support chat, call script, escalation aur social-safe message ready.</p>
        <div className="mt-4 grid grid-cols-4 gap-2 text-center text-xs font-bold">
          {['Case', 'Proof', 'Style', 'Pack'].map((label, index) => <button key={label} type="button" onClick={() => setStep(index + 1)} className={`rounded-2xl px-2 py-3 ${step === index + 1 ? 'bg-primary text-primary-foreground' : 'bg-slate-100 text-slate-600'}`}>{index + 1}. {label}</button>)}
        </div>

        <form action={submit} className="mt-5 space-y-4">
          <div className={step === 1 ? 'grid gap-4' : 'hidden'}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2"><Label>Issue type</Label><Select name="issueType" className="h-12 text-base" defaultValue="REFUND"><option value="REFUND">Refund</option><option value="UPI">UPI issue</option><option value="BANK">Bank issue</option><option value="ECOMMERCE">E-commerce</option><option value="CYBER_FRAUD">Cyber fraud</option><option value="SCHEME">Scheme</option><option value="DOCUMENT">Document</option><option value="SERVICE">Service</option><option value="OTHER">Other</option></Select></div>
              <div className="grid gap-2"><Label>Recipient</Label><Select name="recipientType" className="h-12 text-base" defaultValue="COMPANY_SUPPORT"><option value="COMPANY_SUPPORT">Company support</option><option value="BANK">Bank</option><option value="PAYMENT_APP">Payment app</option><option value="MARKETPLACE">Marketplace</option><option value="AUTHORITY">Authority</option><option value="COLLEGE">College</option><option value="GOVERNMENT_OFFICE">Government office</option></Select></div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2"><div className="grid gap-2"><Label>Company / bank / authority</Label><Input name="companyName" placeholder="Amazon, SBI, PhonePe, college..." /></div><div className="grid gap-2"><Label>Reference ID</Label><Input name="referenceId" placeholder="Order ID / UTR / ticket no." /></div></div>
            <div className="grid gap-4 sm:grid-cols-2"><div className="grid gap-2"><Label>Amount</Label><Input name="amount" placeholder="1299" /></div><div className="grid gap-2"><Label>Issue date</Label><Input name="issueDate" placeholder="2026-05-27" /></div></div>
            <Button type="button" onClick={() => setStep(2)} className="w-full rounded-2xl sm:w-auto">Next: Proof <ArrowRight className="ml-2 h-4 w-4" /></Button>
          </div>

          <div className={step === 2 ? 'grid gap-4' : 'hidden'}>
            <div className="grid gap-2"><Label>Problem details</Label><Textarea name="problem" required rows={8} placeholder="Kya hua, kab hua, amount, response, ticket number, expected solution..." /></div>
            <div className="grid gap-2"><Label>Evidence available</Label><Textarea name="evidence" rows={5} placeholder="Invoice, UTR, screenshot, chat, bank statement, delivery proof..." /></div>
            <div className="grid gap-2"><Label>Desired resolution</Label><Textarea name="desiredResolution" rows={4} placeholder="Refund, reversal, replacement, written status, correction..." /></div>
            <div className="flex gap-2"><Button type="button" variant="outline" onClick={() => setStep(1)}>Back</Button><Button type="button" onClick={() => setStep(3)}>Next: Style</Button></div>
          </div>

          <div className={step === 3 ? 'grid gap-4' : 'hidden'}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2"><Label>Language</Label><Select name="language" defaultValue="ENGLISH" className="h-12 text-base">{LANGUAGE_OPTIONS.map((language) => <option key={language.code} value={language.code}>{language.label} — {language.nativeName}</option>)}</Select></div>
              <div className="grid gap-2"><Label>Tone</Label><Select name="tone" defaultValue="PROFESSIONAL" className="h-12 text-base"><option value="POLITE">Polite</option><option value="FIRM">Firm</option><option value="URGENT">Urgent</option><option value="PROFESSIONAL">Professional</option></Select></div>
            </div>
            <div className="flex flex-wrap gap-2"><Button type="button" variant="outline" onClick={() => setStep(2)}>Back</Button><Button disabled={loading} size="lg" className="rounded-2xl"><CheckCircle2 className="mr-2 h-4 w-4" />{loading ? 'Building pack...' : 'Build submission pack'}</Button></div>
            {error && <p className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}
          </div>
        </form>
      </div>

      <div className="rounded-[2rem] border bg-white p-4 shadow-soft sm:p-6">
        {!result ? (
          <div className="flex min-h-[560px] flex-col items-center justify-center rounded-3xl border border-dashed bg-slate-50 p-6 text-center">
            <MessageCircle className="h-12 w-12 text-slate-400" />
            <h2 className="mt-4 text-2xl font-black">Copy pack yahan dikhega</h2>
            <p className="mt-2 max-w-md text-sm leading-6 text-slate-600">Email, WhatsApp, support chat, call script, social-safe post aur escalation message ek place par.</p>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="rounded-3xl bg-gradient-to-br from-slate-950 to-emerald-950 p-5 text-white">
              <p className="text-sm font-bold uppercase tracking-wider text-emerald-200">Ready to send</p>
              <h2 className="mt-2 text-2xl font-black">{result.title}</h2>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-emerald-50">{result.caseSnapshot}</p>
              <div className="mt-4 flex flex-wrap gap-2"><a href={mailLink} className="rounded-2xl bg-white px-4 py-3 text-sm font-black text-slate-950"><Mail className="mr-2 inline h-4 w-4" />Open email</a><a href={whatsappLink} target="_blank" rel="noreferrer" className="rounded-2xl bg-emerald-400 px-4 py-3 text-sm font-black text-slate-950"><MessageCircle className="mr-2 inline h-4 w-4" />WhatsApp</a></div>
            </div>
            <Draft title="Email subject" text={result.emailSubject} />
            <Draft title="Formal email" text={result.emailBody} />
            <Draft title="WhatsApp message" text={result.whatsappMessage} />
            <Draft title="Support chat message" text={result.supportChatMessage} />
            <Draft title="Call opening script" text={result.callOpeningScript} icon={<PhoneCall className="h-4 w-4" />} />
            <Draft title="Escalation message" text={result.escalationMessage} />
            <Draft title="Social-safe post" text={result.socialPostSafe} />
            <List title="Attachment order" items={result.attachmentOrder} />
            <div className="rounded-2xl bg-slate-50 p-4"><b>Mobile action plan</b><div className="mt-3 space-y-2">{result.mobileActionPlan.map((item) => <div key={item.step} className="rounded-2xl border bg-white p-3"><p className="text-xs font-bold uppercase text-emerald-700">{item.step} · {item.time}</p><p className="text-sm text-slate-700">{item.action}</p></div>)}</div></div>
            <List title="Safety warnings" items={result.warnings} tone="danger" />
            <p className="rounded-2xl border bg-blue-50 p-4 text-xs leading-6 text-blue-900">{result.languageNote}</p>
            <p className="rounded-2xl border bg-amber-50 p-4 text-xs leading-6 text-amber-900"><ShieldAlert className="mr-2 inline h-4 w-4" />{result.disclaimer}</p>
          </div>
        )}
      </div>
    </div>
  )
}

function Draft({ title, text, icon }: { title: string; text: string; icon?: ReactNode }) {
  return <div className="rounded-2xl bg-slate-50 p-4"><div className="mb-2 flex items-center justify-between gap-3"><b className="flex items-center gap-2">{icon}{title}</b><CopyButton text={text} /></div><pre className="whitespace-pre-wrap text-sm leading-7 text-slate-700">{text}</pre></div>
}

function List({ title, items, tone }: { title: string; items: string[]; tone?: 'danger' }) {
  return <div className={`rounded-2xl border p-4 ${tone === 'danger' ? 'border-red-200 bg-red-50 text-red-900' : 'bg-slate-50 text-slate-700'}`}><b>{title}</b><ul className="mt-3 list-disc space-y-2 pl-5 text-sm">{items.map((item) => <li key={item}>{item}</li>)}</ul></div>
}
