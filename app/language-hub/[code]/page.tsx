import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { LANGUAGE_OPTIONS } from '@/lib/i18n/languages'
import { getLanguageHubCopy } from '@/lib/content/language-hub-copy'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function generateStaticParams() {
  return LANGUAGE_OPTIONS.map((language) => ({ code: language.code.toLowerCase() }))
}

export async function generateMetadata({ params }: { params: Promise<{ code: string }> }): Promise<Metadata> {
  const { code } = await params
  const language = LANGUAGE_OPTIONS.find((item) => item.code.toLowerCase() === code.toLowerCase())
  if (!language) return { title: 'Language not found' }
  return { title: `${language.label} support`, description: `Use HaqSathi AI in ${language.label} for complaint, refund, UPI and document help.` }
}

export default async function Page({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params
  const language = LANGUAGE_OPTIONS.find((item) => item.code.toLowerCase() === code.toLowerCase())
  if (!language) notFound()
  const pageCopy = getLanguageHubCopy(language.code)

  return (
    <main className="bg-slate-50">
      <section className="mx-auto max-w-4xl px-4 py-10 sm:py-14">
        <p className="text-sm font-bold uppercase tracking-wider text-primary">Language mode</p>
        <h1 className="mt-3 text-4xl font-black text-slate-950">{language.label} — {language.nativeName}</h1>
        <p className="mt-3 text-slate-600">Region: {language.region} · Script: {language.script}</p>
        <Card className="mt-6 rounded-3xl">
          <CardHeader><CardTitle>Use HaqSathi AI in {language.label}</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm leading-7 text-slate-700">{pageCopy}</p>
            <p className="mt-3 rounded-2xl bg-emerald-50 p-3 text-xs font-semibold leading-5 text-emerald-900">Tip: write your issue in simple words. Keep UTR/order IDs and dates exactly, but never share OTP, password, UPI PIN, CVV or full card details.</p>
          </CardContent>
        </Card>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Link href="/tools/language-draft-translator" className="rounded-3xl bg-white p-5 font-bold shadow-soft hover:shadow-lg">Translate complaint draft</Link>
          <Link href="/dashboard/profile" className="rounded-3xl bg-white p-5 font-bold shadow-soft hover:shadow-lg">Set as profile language</Link>
          <Link href="/chat" className="rounded-3xl bg-white p-5 font-bold shadow-soft hover:shadow-lg">Ask AI assistant</Link>
          <Link href="/complaint" className="rounded-3xl bg-white p-5 font-bold shadow-soft hover:shadow-lg">Generate complaint</Link>
        </div>
      </section>
    </main>
  )
}
