import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth/session'
import { createReferralCode, referralRewardText } from '@/lib/referrals'

const schema = z.object({ email: z.string().email().optional().or(z.literal('')) })

export async function POST(req: Request) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ ok: false, error: 'Login required' }, { status: 401 })

  const parsed = schema.safeParse(await req.json().catch(() => ({})))
  if (!parsed.success) return NextResponse.json({ ok: false, error: 'Valid email daalo ya blank chhodo.' }, { status: 400 })

  let code = createReferralCode()
  for (let i = 0; i < 3; i++) {
    const exists = await db.referralInvite.findUnique({ where: { code }, select: { id: true } })
    if (!exists) break
    code = createReferralCode()
  }

  const invite = await db.referralInvite.create({
    data: { userId: user.id, code, email: parsed.data.email || null, reward: referralRewardText(user.plan) }
  })

  return NextResponse.json({ ok: true, invite })
}
