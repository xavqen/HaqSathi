import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireUser } from '@/lib/auth/session'
import { authorityBookmarkSchema } from '@/lib/validators/phase13'

export async function POST(req: NextRequest) {
  const user = await requireUser()
  const json = await req.json().catch(() => null)
  const parsed = authorityBookmarkSchema.safeParse(json)
  if (!parsed.success) return NextResponse.json({ ok: false, error: 'Invalid input' }, { status: 400 })
  const bookmark = await db.authorityBookmark.upsert({
    where: { userId_authorityId: { userId: user.id, authorityId: parsed.data.authorityId } },
    update: { notes: parsed.data.notes || null },
    create: { userId: user.id, authorityId: parsed.data.authorityId, notes: parsed.data.notes || null }
  })
  return NextResponse.json({ ok: true, bookmark })
}
