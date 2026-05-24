import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireUser } from '@/lib/auth/session'
import { familyProfileSchema } from '@/lib/validators/profile'

export async function POST(req: NextRequest) {
  const user = await requireUser()
  const json = await req.json().catch(() => null)
  const parsed = familyProfileSchema.safeParse(json)
  if (!parsed.success) return NextResponse.json({ ok: false, error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })
  const profile = await db.familyProfile.create({ data: { userId: user.id, ...parsed.data, notes: parsed.data.notes || null } })
  return NextResponse.json({ ok: true, profile })
}
