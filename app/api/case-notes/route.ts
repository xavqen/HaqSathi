import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireUser } from '@/lib/auth/session'
import { caseNoteSchema } from '@/lib/validators/case-workspace'

export async function POST(req: NextRequest) {
  const user = await requireUser()
  const json = await req.json().catch(() => null)
  const parsed = caseNoteSchema.safeParse(json)
  if (!parsed.success) return NextResponse.json({ ok: false, error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })
  const note = await db.caseNote.create({ data: { userId: user.id, ...parsed.data } })
  return NextResponse.json({ ok: true, note })
}
