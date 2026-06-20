import Link from 'next/link'
import { cookies } from 'next/headers'
import { ShieldCheck } from 'lucide-react'
import { ToolGrid } from '@/components/tools/tool-grid'
import { publicTools, toolCategories } from '@/lib/tools/catalog'
import { getShellDictionary } from '@/lib/i18n/dictionaries'
import { normalizeLanguageCode } from '@/lib/i18n/languages'

export const metadata = { title: 'All Tools', description: 'Mobile-first complaint, refund, UPI, document, scam, legal and productivity tools.' }
export const dynamic = 'force-dynamic'

export default async function ToolsPage() {
  const store = await cookies()
  const language = normalizeLanguageCode(store.get('haqsathi_language')?.value)
  const dictionary = getShellDictionary(language)
  return (
    <main className="bg-slate-50">
      <section className="hs-container py-10 sm:py-14">
        <div className="rounded-[2rem] border border-emerald-100 bg-white p-6 shadow-soft sm:p-8 lg:flex lg:items-end lg:justify-between lg:gap-8">
          <div>
            <div className="flex items-center gap-2 text-sm font-black text-emerald-800"><ShieldCheck className="h-5 w-5" /> {dictionary.tools.badge}</div>
            <h1 className="mt-3 text-[2.4rem] font-black leading-none tracking-tight text-slate-950 sm:text-5xl">{dictionary.tools.title}</h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600 sm:text-lg">{dictionary.tools.subtitle}</p>
          </div>
          <Link href="/complaint" className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-primary px-6 py-3 text-base font-black text-primary-foreground shadow-lg shadow-emerald-900/10 lg:mt-0 lg:w-auto">{dictionary.tools.startComplaint}</Link>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-2xl bg-white p-4 text-center shadow-soft"><p className="text-2xl font-black text-slate-950">{publicTools.length}</p><p className="text-xs font-bold text-slate-500">{dictionary.tools.metrics[0]}</p></div>
          <div className="rounded-2xl bg-white p-4 text-center shadow-soft"><p className="text-2xl font-black text-slate-950">{toolCategories.length}</p><p className="text-xs font-bold text-slate-500">{dictionary.tools.metrics[1]}</p></div>
          <div className="rounded-2xl bg-white p-4 text-center shadow-soft"><p className="text-2xl font-black text-slate-950">Mobile</p><p className="text-xs font-bold text-slate-500">{dictionary.tools.metrics[2]}</p></div>
          <div className="rounded-2xl bg-white p-4 text-center shadow-soft"><p className="text-2xl font-black text-slate-950">English</p><p className="text-xs font-bold text-slate-500">{dictionary.tools.metrics[3]}</p></div>
        </div>

        <div className="mt-6"><ToolGrid dictionary={dictionary.tools} /></div>
      </section>
    </main>
  )
}
