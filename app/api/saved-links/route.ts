import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { requireUser } from '@/lib/auth/session'
import { safeJson, dbErrorResponse } from '@/lib/api/errors'

const savedLinkSchema = z.object({
  title: z.string().min(2).max(160),
  url: z.string().url().max(500),
  category: z.string().min(2).max(80),
  state: z.string().optional(),
  notes: z.string().optional()
})

export async function GET() {
  const user = await requireUser()
  try {
    const links = await db.savedOfficialLink.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' }, take: 100 })
    return NextResponse.json({ ok: true, links })
  } catch (error) { return dbErrorResponse(error) }
}

export async function POST(req: NextRequest) {
  const user = await requireUser()
  const body = await safeJson<unknown>(req)
  const parsed = savedLinkSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ ok: false, error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })
  try {
    const link = await db.savedOfficialLink.create({ data: { userId: user.id, ...parsed.data } })
    return NextResponse.json({ ok: true, link })
  } catch (error) { return dbErrorResponse(error) }
}
