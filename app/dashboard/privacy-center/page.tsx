import { requireUser } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { PrivacyCenterForm } from '@/components/forms/privacy-center-form'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Privacy Center | HaqSathi AI' }

export default async function PrivacyCenterPage() {
  const user = await requireUser()
  const consents = await db.privacyConsent.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' } })
  const latest: Record<string, any> = {}
  for (const consent of consents) if (!latest[consent.type]) latest[consent.type] = { type: consent.type, granted: consent.granted, createdAt: consent.createdAt.toISOString() }

  return <div className="space-y-6">
    <div>
      <h1 className="text-3xl font-bold">Privacy Center</h1>
      <p className="mt-2 text-slate-600">Manage consent, communication preferences and data deletion requests here.</p>
    </div>
    <PrivacyCenterForm latest={latest} />
  </div>
}
