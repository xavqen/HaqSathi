import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth/session'

const schema = z.object({ type: z.string().min(2), granted: z.boolean() })

export async function POST(req: Request) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ ok: false, error: 'Login required' }, { status: 401 })
  const parsed = schema.safeParse(await req.json().catch(() => ({})))
  if (!parsed.success) return NextResponse.json({ ok: false, error: 'Invalid consent request' }, { status: 400 })

  const consent = await db.privacyConsent.create({ data: { userId: user.id, type: parsed.data.type, granted: parsed.data.granted } })
  return NextResponse.json({ ok: true, consent })
}

export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ ok: false, error: 'Login required' }, { status: 401 })
  const consents = await db.privacyConsent.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' } })
  return NextResponse.json({ ok: true, consents })
}
