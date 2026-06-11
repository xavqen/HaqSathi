'use client'

import { useState } from 'react'
import { AlertTriangle, CheckCircle2, Loader2, SendHorizontal } from 'lucide-react'

const categories = [
  ['upi-fraud', 'UPI / bank / payment fraud'],
  ['loan-app', 'Loan app harassment'],
  ['job-scam', 'Job / work-from-home scam'],
  ['shopping-refund', 'Shopping / delivery / refund scam'],
  ['govt-form', 'Government form / scheme agent fraud'],
  ['call-sms-link', 'Suspicious call / SMS / link']
]

export function SafetyAlertReportForm() {
  const [category, setCategory] = useState('upi-fraud')
  const [summary, setSummary] = useState('')
  const [city, setCity] = useState('')
  const [consent, setConsent] = useState(false)
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  async function submitReport(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus('loading')
    setMessage('')

    const response = await fetch('/api/safety-alerts/report', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ category, summary, city, consent })
    })
    const data = await response.json().catch(() => null)

    if (!response.ok || !data?.ok) {
      setStatus('error')
      setMessage(data?.error || 'Report could not be submitted. Please try again.')
      return
    }

    setStatus('success')
    setMessage(data.message || 'Report received for safety review.')
    setSummary('')
    setCity('')
    setConsent(false)
  }

  return (
    <form onSubmit={submitReport} className="rounded-[1.75rem] border border-emerald-100 bg-white p-4 shadow-soft sm:p-6">
      <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
        <AlertTriangle className="mt-1 h-5 w-5 shrink-0" />
        <p><strong>Safety first:</strong> Do not share OTP, password, UPI PIN, CVV, full card/bank number, private ID, address or raw document screenshots here.</p>
      </div>

      <div className="mt-5 grid gap-4">
        <label className="grid gap-2 text-sm font-black text-slate-800">
          Scam type
          <select value={category} onChange={(event) => setCategory(event.target.value)} className="min-h-12 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100">
            {categories.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>

        <label className="grid gap-2 text-sm font-black text-slate-800">
          What happened? Keep it short and remove private details.
          <textarea value={summary} onChange={(event) => setSummary(event.target.value)} required minLength={20} maxLength={900} rows={6} className="min-h-36 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-800 outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100" placeholder="Example: A fake courier SMS asked me to pay ₹5 through a link. The page then asked for card details. I closed it and reported it." />
        </label>

        <label className="grid gap-2 text-sm font-black text-slate-800">
          City / state optional
          <input value={city} onChange={(event) => setCity(event.target.value)} maxLength={80} className="min-h-12 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100" placeholder="Example: Bokaro, Jharkhand" />
        </label>

        <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700">
          <input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} required className="mt-1 h-4 w-4 rounded border-slate-300" />
          <span>I confirm this report has no OTP/password/UPI PIN/CVV/private document data and can be reviewed by HaqSathi for safety education.</span>
        </label>
      </div>

      <button type="submit" disabled={status === 'loading'} className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-black text-primary-foreground shadow-lg shadow-emerald-900/10 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto">
        {status === 'loading' ? <Loader2 className="h-4 w-4 animate-spin" /> : <SendHorizontal className="h-4 w-4" />}
        Submit safety report
      </button>

      {message ? (
        <div className={`mt-4 flex items-start gap-2 rounded-2xl border p-4 text-sm font-semibold ${status === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-900' : 'border-rose-200 bg-rose-50 text-rose-900'}`}>
          {status === 'success' ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> : <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />}
          {message}
        </div>
      ) : null}
    </form>
  )
}
