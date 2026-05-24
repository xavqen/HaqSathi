import { NextRequest, NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { languagePreferenceSchema } from '@/lib/validators/tools'
import { logActivity } from '@/lib/activity'

export async function POST(req: NextRequest) {
  const user = await requireUser()
  const json = await req.json().catch(() => null)
  const parsed = languagePreferenceSchema.safeParse(json)
  if (!parsed.success) return NextResponse.json({ ok: false, error: 'Invalid language settings' }, { status: 400 })
  const item = await db.userLanguagePreference.upsert({
    where: { userId: user.id },
    update: parsed.data,
    create: { userId: user.id, ...parsed.data }
  })
  await logActivity({ userId: user.id, action: 'UPDATE', entity: 'LanguagePreference', entityId: item.id, metadata: parsed.data })
  return NextResponse.json({ ok: true, preference: item })
}
