import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { INDIAN_LANGUAGE_OPTIONS, GLOBAL_LANGUAGE_OPTIONS } from '@/lib/i18n/languages'

export const metadata = {
  title: 'Language Hub | HaqSathi AI',
  description: 'HaqSathi AI supports English first, plus major Indian and global languages for easier complaint and scheme guidance.'
}

export default function Page() {
  return (
    <main className="bg-slate-50">
      <section className="mx-auto max-w-7xl px-4 py-10 sm:py-14">
        <div className="rounded-[2rem] bg-gradient-to-r from-slate-950 to-emerald-950 p-6 text-white shadow-soft sm:p-8">
          <p className="text-sm font-bold uppercase tracking-wider text-emerald-200">Primary: English</p>
          <h1 className="mt-3 text-3xl font-black sm:text-5xl">Language support for India + world users</h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-emerald-50 sm:text-base">Users can set their preferred language in profile settings. Tools also work with language-aware output.</p>
          <Link href="/dashboard/profile" className="mt-5 inline-flex rounded-2xl bg-white px-5 py-3 text-sm font-bold text-slate-950">Set profile language</Link>
        </div>
        <LanguageGrid title="Major Indian languages" items={INDIAN_LANGUAGE_OPTIONS} />
        <LanguageGrid title="Major world languages" items={GLOBAL_LANGUAGE_OPTIONS} />
      </section>
    </main>
  )
}

function LanguageGrid({ title, items }: { title: string; items: readonly { code: string; label: string; nativeName: string; region: string; script: string }[] }) {
  return (
    <div className="mt-8">
      <h2 className="text-2xl font-black text-slate-950">{title}</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((language) => (
          <Link href={`/language-hub/${language.code.toLowerCase()}`} key={language.code} className="block">
            <Card className="h-full rounded-3xl transition hover:-translate-y-1 hover:shadow-lg">
              <CardHeader><CardTitle className="text-lg">{language.label}</CardTitle></CardHeader>
              <CardContent><p className="text-xl font-black text-primary">{language.nativeName}</p><p className="mt-2 text-sm text-slate-600">{language.region}</p><p className="mt-1 text-xs font-bold text-slate-500">Script: {language.script}</p></CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
