import { NextRequest, NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { onboardingSchema } from '@/lib/validators/onboarding'
import { logActivity } from '@/lib/activity'

export async function POST(req: NextRequest) {
  const user = await requireUser()
  const json = await req.json().catch(() => null)
  const parsed = onboardingSchema.safeParse(json)
  if (!parsed.success) return NextResponse.json({ ok: false, error: 'Invalid onboarding details' }, { status: 400 })
  const saved = await db.onboardingProgress.upsert({
    where: { userId: user.id },
    update: parsed.data,
    create: { userId: user.id, ...parsed.data }
  })
  await logActivity({ userId: user.id, action: 'UPSERT', entity: 'OnboardingProgress', entityId: saved.id })
  return NextResponse.json({ ok: true })
}
