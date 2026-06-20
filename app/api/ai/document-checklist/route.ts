import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getClientIp, rateLimitAsync } from '@/lib/rate-limit'
import { csrfGuard } from '@/lib/security/csrf'
import { generateDocumentChecklist } from '@/lib/ai/helpers'
import { documentInputSchema } from '@/lib/validators/document'
import { getCurrentUser } from '@/lib/auth/session'

export async function POST(req: NextRequest) {
  const csrf = csrfGuard(req)
  if (csrf) return csrf
  const ip = getClientIp(req.headers)
  if (!(await rateLimitAsync(`docs:${ip}`, 10, 60_000)).ok) return NextResponse.json({ ok: false, error: 'Too many requests' }, { status: 429 })
  const json = await req.json().catch(() => null)
  const parsed = documentInputSchema.safeParse(json)
  if (!parsed.success) return NextResponse.json({ ok: false, error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })
  const result = generateDocumentChecklist(parsed.data)
  const user = await getCurrentUser()
  const cleanInput = JSON.parse(JSON.stringify(parsed.data))
  try {
    await db.documentChecklist.create({ data: { userId: user?.id, type: parsed.data.type, inputData: cleanInput, checklist: result } })
  } catch (e) { console.error('Document checklist save failed', e) }
  return NextResponse.json({ ok: true, result })
}
