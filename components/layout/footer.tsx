import Link from 'next/link'
import { cookies } from 'next/headers'
import { getShellDictionary } from '@/lib/i18n/dictionaries'
import { normalizeLanguageCode } from '@/lib/i18n/languages'
import { SUPPORT_EMAIL } from '@/lib/content/site-contact'

export async function Footer() {
  const store = await cookies()
  const language = normalizeLanguageCode(store.get('haqsathi_language')?.value)
  const dictionary = getShellDictionary(language)
  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="hs-container grid gap-8 py-10 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="text-lg font-black text-slate-950">HaqSathi AI</div>
          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">{dictionary.footer.description}</p>
          <p className="mt-3 text-sm font-semibold text-slate-600">Support: <a className="font-black text-emerald-700 underline underline-offset-4" href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a></p>
          <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold text-slate-500">
            {dictionary.footer.pills.map((pill) => <span key={pill} className="rounded-full bg-white px-3 py-1 shadow-sm">{pill}</span>)}
          </div>
        </div>
        <div>
          <div className="font-bold text-slate-950">{dictionary.footer.tools}</div>
          <div className="mt-3 grid gap-2 text-sm font-semibold text-slate-600">
            <Link href="/tools">{dictionary.nav.allTools}</Link>
            <Link href="/complaint">{dictionary.nav.complaint}</Link>
            <Link href="/upi-help">{dictionary.nav.upiHelp}</Link>
            <Link href="/documents">{dictionary.nav.documents}</Link>
          </div>
        </div>
        <div>
          <div className="font-bold text-slate-950">{dictionary.footer.company}</div>
          <div className="mt-3 grid gap-2 text-sm font-semibold text-slate-600">
            <Link href="/about">About</Link>
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
            <Link href="/contact">Contact</Link>
            <Link href="/disclaimer">{dictionary.disclaimer.link}</Link>
            <Link href="/status">Status</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
