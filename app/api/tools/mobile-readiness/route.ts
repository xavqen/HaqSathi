import { NextRequest, NextResponse } from 'next/server'
import { mobileReadinessSchema } from '@/lib/validators/phase25'
import { buildMobileReadinessReport } from '@/lib/tools/phase25-language-tools'

export async function POST(req: NextRequest) {
  const json = await req.json().catch(() => null)
  const parsed = mobileReadinessSchema.safeParse(json)
  if (!parsed.success) return NextResponse.json({ ok: false, error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })
  return NextResponse.json({ ok: true, result: buildMobileReadinessReport(parsed.data) })
}
