'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { usePrefersReducedMotion } from '@/lib/motion/use-prefers-reduced-motion'
import { Globe2 } from 'lucide-react'
import { LANGUAGE_OPTIONS, getLanguageHtmlSettings, normalizeLanguageCode } from '@/lib/i18n/languages'

const quickLanguages = ['ENGLISH', 'HINDI', 'HINGLISH', 'BENGALI', 'MARATHI', 'TAMIL', 'TELUGU', 'URDU']
const ultraEase = [0.16, 1, 0.3, 1] as const

export function LanguageSwitcher({ current = 'ENGLISH', label = 'Language' }: { current?: string; label?: string }) {
  const router = useRouter()
  const [value, setValue] = useState(normalizeLanguageCode(current))
  const [pending, startTransition] = useTransition()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const reduceMotion = usePrefersReducedMotion()

  useEffect(() => {
    const cookieLanguage = document.cookie
      .split('; ')
      .find((item) => item.startsWith('haqsathi_language='))
      ?.split('=')[1]
    const normalizedCookieLanguage = normalizeLanguageCode(cookieLanguage ? decodeURIComponent(cookieLanguage) : current)
    setValue(normalizedCookieLanguage)
    const htmlSettings = getLanguageHtmlSettings(normalizedCookieLanguage)
    document.documentElement.lang = htmlSettings.htmlLang
    document.documentElement.dir = htmlSettings.dir
    document.documentElement.dataset.appLanguage = normalizedCookieLanguage

    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [current])

  async function changeLanguage(next: string) {
    const normalized = normalizeLanguageCode(next)
    setValue(normalized)
    const htmlSettings = getLanguageHtmlSettings(normalized)
    document.documentElement.lang = htmlSettings.htmlLang
    document.documentElement.dir = htmlSettings.dir
    document.documentElement.dataset.appLanguage = normalized
    await fetch('/api/language/cookie', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ language: normalized })
    }).catch(() => undefined)
    setOpen(false)
    startTransition(() => router.refresh())
  }

  const currentLabel = LANGUAGE_OPTIONS.find((language) => language.code === value)?.label || 'English'
  const panelVariants = {
    hidden: reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.97 },
    visible: { opacity: 1, y: 0, scale: 1 },
    exit: reduceMotion ? { opacity: 0 } : { opacity: 0, y: -6, scale: 0.98 }
  }

  return (
    <div ref={rootRef} className="hs-popover-root relative shrink-0">
      <motion.button
        type="button"
        onClick={() => setOpen((currentOpen) => !currentOpen)}
        aria-expanded={open}
        aria-haspopup="listbox"
        className="flex h-10 min-w-10 transform-gpu cursor-pointer list-none items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-2 text-xs font-black text-slate-700 shadow-sm transition-colors will-change-transform hover:bg-slate-50 sm:h-11 sm:min-w-0 sm:justify-start sm:px-3"
        aria-label={label}
        whileHover={reduceMotion ? undefined : { y: -1 }}
        whileTap={reduceMotion ? undefined : { scale: 0.98 }}
        transition={{ duration: 0.22, ease: ultraEase }}
        tabIndex={0}
        suppressHydrationWarning
      >
        <Globe2 className="h-4 w-4 shrink-0 text-emerald-700" />
        <span className="hidden max-w-[7.5rem] truncate sm:inline">{currentLabel}</span>
      </motion.button>
      <AnimatePresence>
        {open && (
          <motion.div
            key="language-popover"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={panelVariants}
            transition={{ duration: 0.24, ease: ultraEase }}
            suppressHydrationWarning
            className="hs-popover hs-language-popover absolute right-0 z-[75] mt-3 origin-top-right rounded-3xl border border-slate-200 bg-white p-3 shadow-2xl ring-1 ring-slate-900/5"
          >
            <p className="px-2 text-xs font-black uppercase tracking-wider text-slate-400">App language</p>
            <div className="mt-2 grid grid-cols-2 gap-2" role="listbox" aria-label={label}>
              {quickLanguages.map((code) => {
                const language = LANGUAGE_OPTIONS.find((item) => item.code === code)
                if (!language) return null
                const active = value === code
                return (
                  <motion.button
                    key={code}
                    type="button"
                    onClick={() => changeLanguage(code)}
                    whileHover={reduceMotion ? undefined : { y: -1 }}
                    whileTap={reduceMotion ? undefined : { scale: 0.98 }}
                    transition={{ duration: 0.2, ease: ultraEase }}
                    tabIndex={0}
                    suppressHydrationWarning
                    className={`min-h-12 transform-gpu rounded-2xl border px-3 py-2 text-left text-xs font-black transition-colors will-change-transform ${active ? 'border-emerald-300 bg-emerald-50 text-emerald-800' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`}
                    role="option"
                    aria-selected={active}
                  >
                    <span className="block truncate">{language.label}</span>
                    <span className="block truncate text-[10px] font-semibold text-slate-500">{language.nativeName}</span>
                  </motion.button>
                )
              })}
            </div>
            <select value={value} disabled={pending} onChange={(event) => changeLanguage(event.target.value)} className="mt-3 h-11 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500">
              {LANGUAGE_OPTIONS.map((language) => <option key={language.code} value={language.code}>{language.label} — {language.nativeName}</option>)}
            </select>
            <p className="mt-2 px-2 text-[11px] leading-5 text-slate-500">This changes the app shell language instantly. Logged-in users can save assistant tone in Profile → Language.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
