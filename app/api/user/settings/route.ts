import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireUser } from '@/lib/auth/session'
import { notificationPreferenceSchema } from '@/lib/validators/settings'
import { logActivity } from '@/lib/activity'

export async function PATCH(req: NextRequest) {
  const user = await requireUser()
  const json = await req.json().catch(() => null)
  const parsed = notificationPreferenceSchema.safeParse(json)
  if (!parsed.success) return NextResponse.json({ ok: false, error: 'Invalid settings', details: parsed.error.flatten() }, { status: 400 })

  const prefs = await db.notificationPreference.upsert({
    where: { userId: user.id },
    update: parsed.data,
    create: { userId: user.id, ...parsed.data }
  })
  await logActivity({ userId: user.id, action: 'UPDATE', entity: 'NotificationPreference', entityId: prefs.id })
  return NextResponse.json({ ok: true, prefs })
}
