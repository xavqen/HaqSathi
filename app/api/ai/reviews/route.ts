import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth/session'
import { aiOutputReviewSchema } from '@/lib/validators/case-workspace'

export async function POST(req: NextRequest) {
  const user = await getCurrentUser()
  const json = await req.json().catch(() => null)
  const parsed = aiOutputReviewSchema.safeParse(json)
  if (!parsed.success) return NextResponse.json({ ok: false, error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })
  const review = await db.aiOutputReview.create({ data: { userId: user?.id, ...parsed.data, comment: parsed.data.comment || null, sourceId: parsed.data.sourceId || null } })
  return NextResponse.json({ ok: true, review })
}
