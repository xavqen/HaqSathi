import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth/session'
import { csrfGuard } from '@/lib/security/csrf'
import { getClientIp, rateLimitAsync } from '@/lib/rate-limit'
import { createReferralCode, normalizeReferralTargetEmail, referralRewardText } from '@/lib/referrals'

const schema = z.object({ email: z.string().email().optional().or(z.literal('')) })

function referralProgramEnabled() {
  return process.env.REFERRAL_PROGRAM_ENABLED !== 'false'
}

export async function POST(req: NextRequest) {
  const csrf = csrfGuard(req)
  if (csrf) return csrf

  if (!referralProgramEnabled()) return NextResponse.json({ ok: false, error: 'Referral program abhi review mode me hai.' }, { status: 503 })

  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ ok: false, error: 'Login required' }, { status: 401 })

  const ip = getClientIp(req.headers)
  const maxInvites = Number(process.env.REFERRAL_MAX_INVITES_PER_DAY || '10')
  const limited = await rateLimitAsync(`referral:${user.id}:${ip}`, Math.max(1, Math.min(maxInvites, 50)), 24 * 60 * 60 * 1000)
  if (!limited.ok) return NextResponse.json({ ok: false, error: 'Aaj ke liye referral invite limit complete ho gaya.' }, { status: 429 })

  const parsed = schema.safeParse(await req.json().catch(() => ({})))
  if (!parsed.success) return NextResponse.json({ ok: false, error: 'Valid email daalo ya blank chhodo.' }, { status: 400 })

  let code = createReferralCode()
  for (let i = 0; i < 3; i++) {
    const exists = await db.referralInvite.findUnique({ where: { code }, select: { id: true } })
    if (!exists) break
    code = createReferralCode()
  }

  const invite = await db.referralInvite.create({
    data: {
      userId: user.id,
      code,
      email: normalizeReferralTargetEmail(parsed.data.email),
      reward: referralRewardText(user.plan)
    }
  })

  return NextResponse.json({ ok: true, invite })
}
