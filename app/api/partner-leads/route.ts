import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { safeJson, dbErrorResponse } from '@/lib/api/errors'
import { partnerLeadSchema } from '@/lib/validators/phase16'
import { getCurrentUser } from '@/lib/auth/session'

export async function GET() {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  try { return NextResponse.json({ ok: true, leads: await db.partnerLead.findMany({ orderBy: { createdAt: 'desc' }, take: 100 }) }) }
  catch (error) { return dbErrorResponse(error) }
}

export async function POST(req: NextRequest) {
  const body = await safeJson<unknown>(req)
  const parsed = partnerLeadSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ ok: false, error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })
  try {
    const data = { ...parsed.data, email: parsed.data.email || null }
    const lead = await db.partnerLead.create({ data })
    return NextResponse.json({ ok: true, lead })
  } catch (error) { return dbErrorResponse(error) }
}
