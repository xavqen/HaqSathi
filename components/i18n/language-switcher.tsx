'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Globe2 } from 'lucide-react'
import { LANGUAGE_OPTIONS, normalizeLanguageCode } from '@/lib/i18n/languages'

const quickLanguages = ['ENGLISH', 'HINDI', 'HINGLISH', 'BENGALI', 'MARATHI', 'TAMIL', 'TELUGU', 'URDU']

export function LanguageSwitcher({ current = 'ENGLISH', label = 'Language' }: { current?: string; label?: string }) {
  const router = useRouter()
  const [value, setValue] = useState(normalizeLanguageCode(current))
  const [pending, startTransition] = useTransition()

  async function changeLanguage(next: string) {
    const normalized = normalizeLanguageCode(next)
    setValue(normalized)
    await fetch('/api/language/cookie', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ language: normalized })
    }).catch(() => undefined)
    startTransition(() => router.refresh())
  }

  const currentLabel = LANGUAGE_OPTIONS.find((language) => language.code === value)?.label || 'English'

  return (
    <details className="hs-popover-root group relative shrink-0">
      <summary className="flex h-10 min-w-10 cursor-pointer list-none items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-2 text-xs font-black text-slate-700 shadow-sm transition hover:bg-slate-50 sm:h-11 sm:min-w-0 sm:justify-start sm:px-3" aria-label={label}>
        <Globe2 className="h-4 w-4 shrink-0 text-emerald-700" />
        <span className="hidden max-w-[7.5rem] truncate sm:inline">{currentLabel}</span>
      </summary>
      <div className="hs-popover hs-language-popover absolute right-0 z-[75] mt-3 rounded-3xl border border-slate-200 bg-white p-3 shadow-2xl ring-1 ring-slate-900/5">
        <p className="px-2 text-xs font-black uppercase tracking-wider text-slate-400">App language</p>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {quickLanguages.map((code) => {
            const language = LANGUAGE_OPTIONS.find((item) => item.code === code)
            if (!language) return null
            const active = value === code
            return (
              <button key={code} type="button" onClick={() => changeLanguage(code)} className={`min-h-12 rounded-2xl border px-3 py-2 text-left text-xs font-black transition ${active ? 'border-emerald-300 bg-emerald-50 text-emerald-800' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`}>
                <span className="block truncate">{language.label}</span>
                <span className="block truncate text-[10px] font-semibold text-slate-500">{language.nativeName}</span>
              </button>
            )
          })}
        </div>
        <select value={value} disabled={pending} onChange={(event) => changeLanguage(event.target.value)} className="mt-3 h-11 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500">
          {LANGUAGE_OPTIONS.map((language) => <option key={language.code} value={language.code}>{language.label} — {language.nativeName}</option>)}
        </select>
        <p className="mt-2 px-2 text-[11px] leading-5 text-slate-500">This changes the app shell language instantly. Logged-in users can save assistant tone in Profile → Language.</p>
      </div>
    </details>
  )
}
