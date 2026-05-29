import Link from 'next/link'
import { cookies } from 'next/headers'
import { ShieldAlert } from 'lucide-react'
import { getShellDictionary } from '@/lib/i18n/dictionaries'
import { normalizeLanguageCode } from '@/lib/i18n/languages'

export async function DisclaimerBanner() {
  const store = await cookies()
  const language = normalizeLanguageCode(store.get('haqsathi_language')?.value)
  const dictionary = getShellDictionary(language)
  return (
    <div className="border-b border-amber-200/70 bg-amber-50 text-amber-950">
      <div className="mx-auto flex max-w-7xl items-start gap-2.5 px-3 py-2 text-[11px] leading-5 sm:items-center sm:px-5 sm:text-sm">
        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 sm:mt-0" />
        <p className="min-w-0"><strong>{dictionary.disclaimer.prefix}</strong> {dictionary.disclaimer.message} <Link href="/disclaimer" className="font-black underline underline-offset-2">{dictionary.disclaimer.link}</Link></p>
      </div>
    </div>
  )
}
