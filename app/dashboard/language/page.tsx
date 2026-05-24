import { requireUser } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { LanguagePreferenceForm } from '@/components/forms/language-preference-form'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Language & Assistant Style | HaqSathi AI' }
export default async function Page() {
  const user = await requireUser()
  const preference = await db.userLanguagePreference.findUnique({ where: { userId: user.id } }).catch(() => null)
  return <div><h1 className="text-3xl font-black">Language & Assistant Style</h1><p className="mt-2 text-slate-600">AI assistant ko apni preferred language aur tone me set karo.</p><div className="mt-6"><LanguagePreferenceForm initial={preference} /></div></div>
}
