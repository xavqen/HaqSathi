import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { safeJson, dbErrorResponse } from '@/lib/api/errors'
import { knowledgeFeedbackSchema } from '@/lib/validators/phase16'

export async function POST(req: NextRequest) {
  const body = await safeJson<unknown>(req)
  const parsed = knowledgeFeedbackSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ ok: false, error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })
  try { return NextResponse.json({ ok: true, feedback: await db.knowledgeFeedback.create({ data: parsed.data }) }) }
  catch (error) { return dbErrorResponse(error) }
}
