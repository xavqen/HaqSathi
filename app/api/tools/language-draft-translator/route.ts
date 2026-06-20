import { NextRequest, NextResponse } from 'next/server'
import { languageDraftTranslatorSchema } from '@/lib/validators/phase25'
import { buildLanguageDraftPack } from '@/lib/tools/phase25-language-tools'
import { getClientIp, rateLimitAsync } from '@/lib/rate-limit'
import { csrfGuard } from '@/lib/security/csrf'

export async function POST(req: NextRequest) {
  const csrf = csrfGuard(req)
  if (csrf) return csrf
  const ip = getClientIp(req.headers)
  if (!(await rateLimitAsync(`translate:${ip}`, 20, 60_000)).ok) return NextResponse.json({ ok: false, error: 'Too many translation requests. Try again after 1 minute.' }, { status: 429 })
  const json = await req.json().catch(() => null)
  const parsed = languageDraftTranslatorSchema.safeParse(json)
  if (!parsed.success) return NextResponse.json({ ok: false, error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })
  return NextResponse.json({ ok: true, result: buildLanguageDraftPack(parsed.data) })
}
