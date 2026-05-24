import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth/session'

const schema = z.object({ reason: z.string().max(500).optional().or(z.literal('')) })

export async function POST(req: Request) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ ok: false, error: 'Login required' }, { status: 401 })
  const parsed = schema.safeParse(await req.json().catch(() => ({})))
  if (!parsed.success) return NextResponse.json({ ok: false, error: 'Invalid request' }, { status: 400 })

  const existing = await db.dataDeletionRequest.findFirst({ where: { userId: user.id, status: { in: ['REQUESTED', 'IN_REVIEW'] } } })
  if (existing) return NextResponse.json({ ok: true, request: existing, message: 'Deletion request already pending.' })

  const request = await db.dataDeletionRequest.create({ data: { userId: user.id, reason: parsed.data.reason || null } })
  return NextResponse.json({ ok: true, request })
}
