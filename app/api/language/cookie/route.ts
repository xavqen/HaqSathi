import { NextRequest, NextResponse } from 'next/server'
import { normalizeLanguageCode } from '@/lib/i18n/languages'

export async function POST(req: NextRequest) {
  const json = await req.json().catch(() => null)
  const language = normalizeLanguageCode(json?.language)
  const response = NextResponse.json({ ok: true, language })
  response.cookies.set('haqsathi_language', language, { sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 365 })
  return response
}
