import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth/session'
import { safeJson, dbErrorResponse } from '@/lib/api/errors'
import { legalNoticeSchema } from '@/lib/validators/advanced-tools'
import { buildLegalNoticeDraft } from '@/lib/tools/advanced-generators'
import { rateLimit } from '@/lib/rate-limit'

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local'
  const limited = rateLimit(`legal-notice:${ip}`, 10, 60_000)
  if (!limited.ok) return NextResponse.json({ ok: false, error: 'Too many requests. 1 minute baad try karo.' }, { status: 429 })
  const body = await safeJson<unknown>(req)
  const parsed = legalNoticeSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ ok: false, error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })
  const result = buildLegalNoticeDraft(parsed.data)
  try {
    const user = await getCurrentUser()
    await db.legalToolResult.create({ data: { userId: user?.id, tool: 'LEGAL_NOTICE', input: parsed.data, result } })
  } catch (error) {
    console.error('legal notice save failed', error)
  }
  return NextResponse.json({ ok: true, result })
}
