import { requireUser } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { LanguagePreferenceForm } from '@/components/forms/language-preference-form'
import { INDIAN_LANGUAGE_OPTIONS, GLOBAL_LANGUAGE_OPTIONS } from '@/lib/i18n/languages'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Language & Assistant Style' }
export default async function Page() {
  const user = await requireUser()
  const preference = await db.userLanguagePreference.findUnique({ where: { userId: user.id } }).catch(() => null)
  return (
    <div>
      <h1 className="text-3xl font-black">Language & Assistant Style</h1>
      <p className="mt-2 text-slate-600">English is the default app language. Major Indian and global languages are available here.</p>
      <div className="mt-6"><LanguagePreferenceForm initial={preference} /></div>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <section className="rounded-3xl border bg-white p-5 shadow-soft">
          <h2 className="text-xl font-black">India languages</h2>
          <div className="mt-4 flex flex-wrap gap-2">{INDIAN_LANGUAGE_OPTIONS.map((l) => <span key={l.code} className="rounded-full border bg-slate-50 px-3 py-1 text-xs font-bold text-slate-700">{l.label}</span>)}</div>
        </section>
        <section className="rounded-3xl border bg-white p-5 shadow-soft">
          <h2 className="text-xl font-black">World languages</h2>
          <div className="mt-4 flex flex-wrap gap-2">{GLOBAL_LANGUAGE_OPTIONS.map((l) => <span key={l.code} className="rounded-full border bg-slate-50 px-3 py-1 text-xs font-bold text-slate-700">{l.label}</span>)}</div>
        </section>
      </div>
    </div>
  )
}
