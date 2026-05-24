import { requireUser } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { OnboardingForm } from '@/components/forms/onboarding-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const dynamic = 'force-dynamic'
export default async function Page() {
  const user = await requireUser()
  const onboarding = await db.onboardingProgress.findUnique({ where: { userId: user.id } })
  return <div><h1 className="text-3xl font-black">Onboarding</h1><p className="mt-2 text-slate-600">Apna goal set karo taaki dashboard aur tools zyada useful lagein.</p><div className="mt-6"><OnboardingForm initial={onboarding} /></div><Card className="mt-6"><CardHeader><CardTitle>Suggested next step</CardTitle></CardHeader><CardContent><p className="text-slate-600">Agar aapka main goal complaint/refund hai, pehle complaint generator use karo aur phir reminder set karo.</p></CardContent></Card></div>
}
