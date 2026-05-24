import { NextRequest, NextResponse } from 'next/server'
import { callScriptSchema } from '@/lib/validators/phase13'
import { generateCallScript } from '@/lib/tools/call-script-generator'

export async function POST(req: NextRequest) {
  const json = await req.json().catch(() => null)
  const parsed = callScriptSchema.safeParse(json)
  if (!parsed.success) return NextResponse.json({ ok: false, error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })
  return NextResponse.json({ ok: true, result: generateCallScript(parsed.data) })
}
