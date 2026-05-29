import { db } from '@/lib/db'
import { requireUser } from '@/lib/auth/session'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { NotificationSettingsForm } from '@/components/forms/notification-settings-form'

export const dynamic = 'force-dynamic'
export default async function Page() {
  const user = await requireUser()
  const prefs = await db.notificationPreference.findUnique({ where: { userId: user.id } }).catch(() => null)
  const initial = {
    emailReminders: prefs?.emailReminders ?? true,
    weeklyDigest: prefs?.weeklyDigest ?? true,
    productUpdates: prefs?.productUpdates ?? false,
    whatsappPlaceholder: prefs?.whatsappPlaceholder ?? false,
    smsPlaceholder: prefs?.smsPlaceholder ?? false,
    language: prefs?.language || 'ENGLISH'
  }
  return <div><h1 className="text-3xl font-black">Settings</h1><p className="mt-2 text-slate-600">Notifications aur language preference manage karein.</p><Card className="mt-6"><CardHeader><CardTitle>Notification Preferences</CardTitle></CardHeader><CardContent><NotificationSettingsForm initial={initial} /></CardContent></Card></div>
}
